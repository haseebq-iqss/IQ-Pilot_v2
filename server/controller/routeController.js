const Cab = require("../models/cab");
const User = require("../models/user");
const Route = require("../models/route");
const { catchAsync } = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const shuffleArray = (nums) => {
  const arr = [...nums];
  for (let i = arr.length - 1; i >= 0; i--) {
    const j = Math.floor(Math.random() * i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

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

const assignCabToEmployees = async (
  workLocation,
  currentShift,
  typeOfRoute,
  employees,
  cabs
) => {
  const remaining_employees = [...employees];
  const groups = [];
  const shuffled_cabs = shuffleArray(cabs);
  const assigned_employees = new Set();

  for (const cab of shuffled_cabs) {
    if (remaining_employees.length === 0) break;

    if (cab.routes.length === 2) {
      console.log(`Cab has already been assigned with two routes`);
      break;
    }

    // CHECK FOR CONFLICTING ROUTES
    const conflicting_routes = cab.routes.some((route) => {
      const [route_start, route_end] = route.currentShift.split("-");
      const [new_route_start, new_route_end] = route.currentShift.split("-");
      return (
        route_start === new_route_start &&
        (route_end !== new_route_end || route.workLocation !== workLocation)
      );
    });
    if (conflicting_routes) continue;

    // GET ROUTES FOR PICKUP/DROP TYPE
    const cab_routes_for_shift_and_location = cab.routes.filter((route) => {
      return (
        route.typeOfRoute === typeOfRoute &&
        route.workLocation === workLocation &&
        route.currentShift === currentShift
      );
    });

    // GET PASSENGERS
    let cab_passengers = cab_routes_for_shift_and_location.flatMap(
      (route) => route.passengers
    );
    const populated_passengers = await Promise.all(
      cab_passengers.map((passenger) => {
        if (passenger) assigned_employees.add(passenger.toString());
        const user = User.findById(passenger);
        return user;
      })
    );
    cab_passengers = populated_passengers.filter((val) => val !== null);

    const available_capacity = cab.seatingCapacity - cab_passengers.length;
    if (available_capacity <= 0) continue;

    const group = {
      cab,
      passengers: [...cab_passengers],
      availableCapacity: available_capacity,
    };
    for (
      let i = 0;
      i < remaining_employees.length && group.availableCapacity > 0;
      i++
    ) {
      const employee = remaining_employees[i];
      if (!assigned_employees.has(employee._id.toString())) {
        group.passengers.push(employee);
        group.availableCapacity--;
        assigned_employees.add(employee._id.toString());
        remaining_employees.splice(i, 1);
        i--;
      }
    }
    groups.push(group);
  }
  return groups;
};

exports.createShift = catchAsync(async (req, res, next) => {
  const { workLocation, currentShift, typeOfRoute, ref_coords } = req.body;
  const PROXIMITY_THRESHOLD = 8;
  const present_day = new Date();
  present_day.setHours(0, 0, 0, 0);

  const closestEmployees = await User.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: ref_coords,
        },
        key: "pickUp.coordinates",
        distanceField: "distance",
        distanceMultiplier: 0.001,
        maxDistance: PROXIMITY_THRESHOLD * 1000,
      },
    },
    {
      $match: {
        workLocation: workLocation,
        currentShift: currentShift,
      },
    },
  ]);

  if (closestEmployees.length === 0)
    return next(
      new AppError(
        `No employees found as of now for this shift:${currentShift} and workLocation:${workLocation}`,
        404
      )
    );

  const routes = await Route.find({});

  // CHECK FOR ACTIVE ROUTES
  if (routes.length >= 1) {
    const active_routes = await activeRoutesFun(routes);
    const check_active_routes = active_routes.find((route) => {
      return (
        route.workLocation === workLocation &&
        route.currentShift === currentShift &&
        route.typeOfRoute === typeOfRoute
      );
    });
    if (check_active_routes)
      return next(
        new AppError(
          `Team Members for this shift:${currentShift} and work-loction:${workLocation} are already rostered!`,
          400
        )
      );
  }

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
  for (const cab of cabs) {
    cab.routes = cab.routes
      .map((route) => {
        const route_created = new Date(route.createdAt);
        route_created.setHours(0, 0, 0, 0);
        const end_date = new Date(route.createdAt);
        end_date.setDate(route_created.getDate() + route.daysRouteIsActive);
        end_date.setHours(0, 0, 0, 0);
        if (
          route_created.getTime() < present_day.getTime() &&
          end_date.getTime() < present_day.getTime()
        )
          return null;
        return route;
      })
      .filter((val) => val !== null);
  }

  const groups = await assignCabToEmployees(
    workLocation,
    currentShift,
    typeOfRoute,
    closestEmployees,
    cabs
  );

  res.status(200).json({
    message: "Success",
    data: groups,
    results: groups.length,
  });
});

exports.createRoute = catchAsync(async (req, res, next) => {
  const {
    cabEmployeeGroups,
    workLocation,
    currentShift,
    typeOfRoute,
    daysRouteIsActive,
  } = req.body;

  if (!Array.isArray(cabEmployeeGroups) || cabEmployeeGroups.length === 0)
    return next(new AppError(`Invalid or cabEmployeeGroups is empty`, 400));

  for (const group of cabEmployeeGroups) {
    const { cab, passengers, availableCapacity } = group;
    const route = await Route.create({
      cab,
      passengers,
      workLocation,
      currentShift,
      typeOfRoute,
      availableCapacity,
      daysRouteIsActive,
    });
  }
  res.status(201).json({
    status: "Success",
    message: "Shifts confirmed and routes created successfully",
  });
});

exports.getRoute = catchAsync(async (req, res, next) => {
  const route = await Route.findById(req.params.id).populate({
    path: "cab passengers",
  });
  if (!route)
    return next(new AppError(`No route document with this id found...`, 404));
  res.status(200).json({ status: "Success", data: route });
});

exports.getRoutes = catchAsync(async (req, res, next) => {
  const routes = await Route.find({})
    .sort({ createdAt: -1 })
    .populate({
      path: "cab",
      populate: { path: "cabDriver", select: "fname lname phone" },
    })
    .populate("passengers");
  if (!routes) {
    return next(new AppError("No routes found...", 404));
  }
  res.status(200).json({ status: "Success", data: routes });
});

exports.getActiveRoutes = catchAsync(async (req, res, next) => {
  const all_routes = await Route.find({})
    .populate({
      path: "cab",
      populate: { path: "cabDriver" },
    })
    .populate("passengers");
  const active_routes = await activeRoutesFun(all_routes);

  if (active_routes.length === 0) {
    return next(new AppError(`No Active Routes as of now...`, 404));
  }

  res.status(200).json({
    status: "Success",
    results: active_routes.length,
    data: active_routes,
  });
});

exports.updateRoute = catchAsync(async (req, res, next) => {
  const update_body = req.body;
  const id = req.params.id;
  const updated_route = await Route.findByIdAndUpdate(id, update_body, {
    runValidators: true,
    new: true,
  })
    .populate("passengers")
    .populate("cab");
  if (!updated_route)
    return next(new AppError(`Route with this id: ${id} is not found`, 404));

  res.status(201).json({ status: "Success", updated_route });
});

exports.pendingPassengers = catchAsync(async (req, res, next) => {
  const all_routes = await Route.find({})
    .populate({
      path: "cab",
      populate: { path: "cabDriver" },
    })
    .populate("passengers");
  const active_routes = await activeRoutesFun(all_routes);
  if (active_routes.length === 0) {
    return next(new AppError(`No Active Routes as of now...`, 404));
  }

  const passengerIds = active_routes.flatMap((route) => route.passengers);
  const pending_passengers = await User.find({
    _id: { $nin: passengerIds },
    role: { $ne: "driver" },
  });
  res.status(200).json({
    status: "Success",
    no_pending_passengers: pending_passengers.length,
    pending_passengers,
  });
});

exports.rosteredPassengers = catchAsync(async (req, res, next) => {
  const all_routes = await Route.find({})
    .populate({
      path: "cab",
      populate: { path: "cabDriver" },
    })
    .populate("passengers");
  const active_routes = await activeRoutesFun(all_routes);
  if (active_routes.length === 0) {
    return next(new AppError(`No Active Routes as of now...`, 404));
  }

  const passengerIds = active_routes.flatMap((route) => route.passengers);

  const rostered_passengers = await User.find({
    _id: { $in: passengerIds },
    role: { $ne: "driver" },
  });

  res.status(200).json({
    status: "Success",
    no_of_rostered_passengers: rostered_passengers.length,
    rostered_passengers,
  });
});

exports.driverRoute = catchAsync(async (req, res, next) => {
  const pick_up_arr = [];
  const drop_off_arr = [];

  const id = req.params.id;
  const cab = await Cab.findOne({ cabDriver: id });
  if (!cab)
    return next(new AppError(`No cab found with this driver id: ${id}`, 404));

  const { _id: cab_id } = cab;

  const cab_all_routes = await Route.find({ cab: cab_id })
    .populate({
      path: "cab",
      populate: "cabDriver",
    })
    .populate("passengers");

  if (cab_all_routes.length === 0)
    return next(new AppError(`No routes assigned to this cab: ${cab_id}`, 404));

  const active_routes = await activeRoutesFun(cab_all_routes);
  if (active_routes.length === 0)
    return next(
      new AppError(`No active routes assigned to this cab: ${cab_id}`, 404)
    );

  active_routes.forEach((route) => {
    if (route.typeOfRoute === "pickup") pick_up_arr.push(route);
    else if (route.typeOfRoute === "drop") drop_off_arr.push(route);
  });

  res
    .status(200)
    .json({ status: "Success", data: { pick_up_arr, drop_off_arr } });
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
