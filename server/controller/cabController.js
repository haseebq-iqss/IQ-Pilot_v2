const Cab = require("../models/cab");
const User = require("../models/user");
const Route = require("../models/route");
const AppError = require("../utils/appError");
const { catchAsync } = require("../utils/catchAsync");

const activeRoutesFun = async (all_routes) => {
  const present_day = new Date();
  present_day.setHours(0, 0, 0, 0);

  const active_routes = all_routes.filter((route) => {
    const route_created = route.createdAt;
    route_created.setHours(0, 0, 0, 0);
    const end_date = new Date();
    end_date.setDate(route_created.getDate() + route.daysRouteIsActive);
    end_date.setHours(0, 0, 0, 0);

    return (
      route_created.getTime() <= present_day.getTime() &&
      present_day.getTime() <= end_date.getTime()
    );
  });
  return active_routes;
};

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

exports.getEmployeeCab = catchAsync(async (req, res, next) => {
  let found_route;
  const emp_id = req.params.id;
  const employee = await User.findById(emp_id);
  if (!employee)
    return next(new AppError(`No employee with this id:${emp_id}`, 404));

  const routes = await Route.find({
    workLocation: employee.workLocation,
    currentShift: employee.currentShift,
  });

  const active_routes = await activeRoutesFun(routes);
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
  const routes = await Route.find({})
    .populate({ path: "cab", populate: "cabDriver" })
    .populate("passengers");
  if (routes.length === 0) return next(new AppError(`No routes found...`, 404));

  const active_routes = await activeRoutesFun(routes);
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
    const group = {
      cab_driver: cab_details.cabDriver,
      number_plate: cab_details.numberPlate,
      cab_number,
      passengers: [...route.passengers],
    };
    passenger_details.push(group);
  }

  res.status(200).json({ status: "Success", data: passenger_details });
});

exports.availableCabs = catchAsync(async (req, res, next) => {
  const all_routes = await Route.find({});
  const cabs = await Cab.find({});

  const active_routes = await activeRoutesFun(all_routes);

  const active_routes_no_capacity = active_routes.filter(
    (route) => route.availableCapacity === 0
  );
  const cabs_not_available = active_routes_no_capacity.map((route) =>
    route.cab.toString()
  );
  const no_of_cabs_available = cabs.filter(
    (cab) => !cabs_not_available.includes(cab._id.toString())
  );

  res.status(200).json({
    status: "Success",
    results: no_of_cabs_available.length,
    no_of_cabs_available,
  });
});