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

  const cab = await Cab.findById(id).populate("cabDriver");
  if (cab.length === 0)
    return next(new AppError(`No cab for this driver...`, 404));
  res.status(200).json({ status: "Success", data: cab });
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

  // NOT TO CONSIDER NON-ACTIVE ROUTES ASSIGNED TO CABS(FILTERING OF CABS)
  const present_day = new Date();
  present_day.setUTCHours(0, 0, 0, 0);
  for (const cab of cabs) {
    cab.routes = cab.routes.filter((route) => {
      return (
        route.activeOnDate.getDate() === present_day.getDate() + 1 &&
        route.activeOnDate.getMonth() === present_day.getMonth() &&
        route.activeOnDate.getFullYear() === present_day.getFullYear()
      );
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
