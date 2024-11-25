const Cab = require("../models/cab");
const User = require("../models/user");
const Route = require("../models/route");
const AppError = require("../utils/appError");
const { catchAsync } = require("../utils/catchAsync");
const getActiveRoutes = require("../utils/activeRoutesFun");

exports.createCab = catchAsync(async (req, res, next) => {
  const cab = await Cab.create(req.body);
  res.status(201).json({ status: "Success", data: cab });
});

exports.updateCab = catchAsync(async (req, res, next) => {
  const updated_cab = await Cab.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate("cabDriver");
  if (!updated_cab) {
    return next(new AppError(`No cab with this id`, 404));
  }
  res.status(201).json({ status: "Success", data: updated_cab });
});

exports.deleteCab = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const deleted_cab = await Cab.findByIdAndDelete(id);
  if (!deleted_cab) {
    return next(new AppError(`No document found with this id`, 404));
  }
  await User.findByIdAndDelete(deleted_cab.cabDriver);
  res.status(204).json({ status: "Success" });
});

exports.getAllCabs = catchAsync(async (req, res, next) => {
  const cabs = await Cab.find({}).populate("cabDriver");
  if (!cabs) return next(new AppError(`No cabs available...`, 404));
  res.status(200).json({ status: "Success", results: cabs.length, data: cabs });
});

exports.getCabByDriver = catchAsync(async (req, res, next) => {
  const cab = await Cab.find({ cabDriver: req.params.id }).populate(
    "cabDriver"
  );
  if (cab.length === 0)
    return next(new AppError(`No cab for this driver...`, 404));
  res.status(200).json({ status: "Success", data: cab });
});

exports.getCabByID = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  try {

    const cab = await Cab.findById(id).populate("cabDriver");
    if (cab.length === 0) {
      const cabFromDriverId = await Cab.find({ cabDriver: id }).populate("cabDriver");
      if (!cabFromDriverId) return res.status(400).json({ status: "Error", message: "No cab found for this driver" });
      console.log(cabFromDriverId)
      return res.status(200).json({ status: "Success", data: cabFromDriverId });
    }
    res.status(200).json({ status: "Success", data: cab });
  } catch (err) {
    return next(new AppError(`No cab with this id...`, 404));
  }
});

exports.getCabByDriverID = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  try {
    const cab = await Cab.findOne({ cabDriver: id }).populate("cabDriver");
    console.log(cab)
    if (cab.length === 0) {
      return res.status(400).json({ status: "Error", message: "No cab found for this driver" });
    }
    res.status(200).json({ status: "Success", data: cab });
  } catch (err) {
    return next(new AppError(`No cab with this id...`, 404));
  }
});

exports.getEmployeeCab = catchAsync(async (req, res, next) => {
  let found_route;
  const emp_id = req.params.id;
  const employee = await User.findById(emp_id);
  if (!employee)
    return next(new AppError(`No employee with this id:${emp_id}`, 404));

  const [emp_start_time, emp_end_time] = employee.currentShift.split("-");

  const routes = await Route.find({
    workLocation: employee.workLocation,
    $or: [
      { currentShift: emp_start_time, typeOfRoute: "pickup" },
      { currentShift: emp_end_time, typeOfRoute: "drop" },
    ],
  });

  const active_routes = await getActiveRoutes(routes);

  const not_completed_active_routes = active_routes.filter(
    (route) => route.routeStatus !== "completed"
  );
  for (const route of not_completed_active_routes) {
    const flag = route.passengers.some(
      (passenger) => passenger.toString() === emp_id.toString()
    );
    if (flag) {
      found_route = await Route.findById(route._id)
        .populate({
          path: "cab",
          populate: { path: "cabDriver" },
        })
        .populate("passengers");
      break;
    }
  }
  if (!found_route) {
    return res.status(200).json({ status: "Success", message: "NA" });
  }
  res.status(200).json({ status: "Success", found_route });
});

exports.getTMSAssignedCabs = catchAsync(async (req, res, next) => {
  const routes = await Route.find({}).populate({
    path: "cab",
    populate: "cabDriver",
  });
  if (routes.length === 0) return next(new AppError(`No routes found...`, 404));

  const active_routes = await getActiveRoutes(routes);
  if (active_routes.length === 0)
    return next(new AppError(`No active routes found...`, 404));

  const not_completed_active_routes = active_routes.filter(
    (route) => route.routeStatus !== "completed"
  );
  if (not_completed_active_routes.length === 0)
    return next(new AppError(`No active(not-completed) routes found...`, 404));

  let passenger_details = [];
  for (const route of not_completed_active_routes) {
    const cab_details = route.cab;
    const cab_number = cab_details.cabNumber;
    route.passengers.forEach((passenger) => {
      passenger_details.push({ cab_number, id: passenger });
    });
  }

  res.status(200).json({ status: "Success", data: passenger_details });
});

exports.availableCabs = catchAsync(async (req, res, next) => {
  const cabs = await Cab.aggregate([
    {
      $lookup: {
        from: "routes",
        foreignField: "cab",
        localField: "_id",
        as: "routes",
      },
    },
    {
      $lookup: {
        from: "users",
        foreignField: "_id",
        localField: "cabDriver",
        as: "cabDriver",
      },
    },
  ]);

  //Filter out non-active routes
  const present_day = new Date(
    Date.UTC(
      new Date().getUTCFullYear(),
      new Date().getUTCMonth(),
      new Date().getUTCDate()
    )
  );

  for (const cab of cabs) {
    cab.routes = cab.routes.filter((route) => {
      const routeDate = new Date(
        Date.UTC(
          route.activeOnDate.getUTCFullYear(),
          route.activeOnDate.getUTCMonth(),
          route.activeOnDate.getUTCDate()
        )
      );
      return routeDate.getTime() === present_day.getTime();
    });
  }
  const cabsShiftForCurrentDay = [];
  for (const cab of cabs) {
    const cabObj = {
      _id: cab._id,
      cabNumber: cab.cabNumber,
      seatingCapacity: cab.seatingCapacity,
      numberPlate: cab.numberPlate,
      carModel: cab.carModel,
      carColor: cab.carColor,
      cabDriver: cab.cabDriver,
      occupiedShifts: [],
    };
    cab.routes.forEach((route) => {
      cabObj.occupiedShifts.push(route.currentShift);
    });
    cabObj.occupiedShifts.length < 2 && cabsShiftForCurrentDay.push(cabObj);
  }

  res.status(200).json({
    status: "Success",
    noOfCabsAvailable: cabsShiftForCurrentDay.length,
    data: cabsShiftForCurrentDay,
  });
});
