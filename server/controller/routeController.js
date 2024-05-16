const Cab = require("../models/cab");
const User = require("../models/user");
const Route = require("../models/route");
const { catchAsync } = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const assignCabToEmployees = async (
  employees,
  cabs,
  workLocation,
  currentShift,
  typeOfRoute
) => {
  const remainingEmployees = [...employees];
  const groups = [];
  const assignedEmployees = new Set();

  for (const cab of cabs) {
    if (cab.routes.length === 2) {
      console.log("Cab is already assigned with a maximum of two routes only");
      continue;
    }

    if (cab.routes.length >= 1) {
      const res = cab.routes.some((route) => {
        const routeStart = route.currentShift.split("-")[0];
        const routeEnd = route.currentShift.split("-")[1];
        const newStart = currentShift.split("-")[0];
        const newEnd = currentShift.split("-")[1];

        if (routeStart === newStart) {
          if (routeEnd !== newEnd) {
            return true;
          }
          if (workLocation !== route.workLocation) return true;
        }
        return false;
      });

      if (res) continue;
    }

    const cabRoutesForShiftAndLocation = cab.routes.filter((route) => {
      return (
        route.currentShift === currentShift &&
        route.workLocation === workLocation &&
        route.typeOfRoute === typeOfRoute
      );
    });

    let cabPassengers = cabRoutesForShiftAndLocation.flatMap(
      (route) => route.passengers
    );
    const populatedPassengers = await Promise.all(
      cabPassengers.map(async (passengerID) => {
        passengerID ? assignedEmployees.add(passengerID.toString()) : "";
        const user = User.findById(passengerID);
        return user;
      })
    );
    cabPassengers = populatedPassengers.filter((val) => val !== null);

    const availableCapacity = cab.seatingCapacity - cabPassengers.length;
    if (availableCapacity <= 0) continue;
    const group = {
      cab: cab,
      passengers: [...cabPassengers],
      availableCapacity,
    };

    for (
      let i = 0;
      i < remainingEmployees.length && group.availableCapacity > 0;
      i++
    ) {
      const employee = remainingEmployees[i];
      if (!assignedEmployees.has(employee._id.toString())) {
        group.passengers.push(employee);
        assignedEmployees.add(employee._id.toString());
        group.availableCapacity--;
      }
    }

    remainingEmployees.splice(0, group.passengers.length);
    if (group.passengers.length === 0) continue;
    groups.push(group);
  }
  return groups;
};

exports.createShift = catchAsync(async (req, res, next) => {
  const { workLocation, currentShift, typeOfRoute, ref_coords } = req.body;

  const closestEmployees = await User.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: ref_coords,
        },
        key: "pickUp.coordinates",
        distanceField: "distance",
        spherical: true,
        distanceMultiplier: 0.001,
      },
    },
    {
      $match: {
        workLocation,
        currentShift,
      },
    },
  ]);

  if (closestEmployees.length === 0) {
    return res.status(404).json({
      message: "No Team Members Found in this Selected Shift...",
    });
  }

  const routes = await Route.find();
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  if (routes.length > 0) {
    const routesForCurrentDate = routes.filter((route) => {
      const routeCreatedAt = new Date(route.createdAt);
      routeCreatedAt.setHours(0, 0, 0, 0);
      return (
        routeCreatedAt.getTime() === currentDate.getTime() &&
        route.workLocation === workLocation &&
        route.currentShift === currentShift &&
        route.typeOfRoute === typeOfRoute
      );
    });
    if (routesForCurrentDate.length !== 0)
      return res.status(400).json({
        message: "All Team Members in Selected Shift are Already Rostered!",
      });
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
        localField: "cabDriver",
        foreignField: "_id",
        as: "cabDriver",
      },
    },
  ]);
  for (const cab of cabs) {
    cab.routes = cab.routes
      .map((route) => {
        const routeCreatedAt = new Date(route.createdAt);
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        if (routeCreatedAt < currentDate) route = null;
        return route;
      })
      .filter((route) => route !== null);
  }

  const groups = await assignCabToEmployees(
    closestEmployees,
    cabs,
    workLocation,
    currentShift,
    typeOfRoute
  );

  res.status(200).json({
    status: "Success",
    data: groups,
    workLocation,
    currentShift,
    typeOfRoute,
  });

  // const cabs = await Cab.aggregate([
  //   {
  //     $lookup: {
  //       from: "routes",
  //       foreignField: "cab",
  //       localField: "_id",
  //       as: "routes",
  //     },
  //   },
  //   {
  //     $addFields: {
  //       passengerCount: {
  //         $reduce: {
  //           input: {
  //             $filter: {
  //               input: "$routes",
  //               as: "route",
  //               cond: {
  //                 $and: [
  //                   { $eq: ["$$route.currentShift", currentShift] },
  //                   { $eq: ["$$route.workLocation", workLocation] },
  //                 ],
  //               },
  //             },
  //           },
  //           initialValue: 0,
  //           in: { $add: ["$$value", { $size: "$$this.passengers" }] },
  //         },
  //       },
  //     },
  //   },
  //   {
  //     $match: {
  //       $expr: { $lt: ["$passengerCount", "$seatingCapacity"] },
  //     },
  //   },
  //   {
  //     $lookup: {
  //       from: "users",
  //       localField: "cabDriver",
  //       foreignField: "_id",
  //       as: "cabDriver",
  //     },
  //   },
  // ]);

  // const groups = await assignCabToEmployees(
  //   closestEmployees,
  //   cabs,
  //   workLocation,
  //   currentShift
  // );

  // res.status(200).json({
  //   status: "Success",
  //   data: groups,
  //   workLocation,
  //   currentShift,
  //   typeOfRoute,
  // });
});

exports.createRoute = catchAsync(async (req, res, next) => {
  const { cabEmployeeGroups, workLocation, currentShift, typeOfRoute } =
    req.body;

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
    });
  }
  res.status(201).json({
    status: "Success",
    message: "Shifts confirmed and routes created successfully",
  });
});

exports.getRoute = catchAsync(async (req, res, next) => {
  const route = await Route.findById(req.params.id).populate({
    path: "cab",
    select: "cabNumber cabDriver passengers",
    populate: { path: "cabDriver passengers", select: "fname lname phone" },
  });
  if (!route)
    return next(new AppError(`No route document with this id found...`, 404));
  res.status(200).json({ status: "Success", data: route });
});

exports.getRoutes = catchAsync(async (req, res, next) => {
  const routes = await Route.find({})
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

exports.getCurrentDayRoutes = catchAsync(async (req, res, next) => {
  const currentDay = new Date();
  currentDay.setHours(0, 0, 0, 0);
  const routes = await Route.find({})
    .populate({
      path: "cab",
      populate: { path: "cabDriver", select: "fname lname phone" },
    })
    .populate("passengers");
  const curr_day_routes = routes.filter((route) => {
    const routeCreatedAt = new Date(route.createdAt);
    routeCreatedAt.setHours(0, 0, 0, 0);
    return routeCreatedAt.getTime() === currentDay.getTime();
  });
  if (curr_day_routes.length === 0)
    return next(new AppError(`No Routes for the Current Day...`, 404));
  res.status(200).json({
    status: "Success",
    results: curr_day_routes.length,
    data: curr_day_routes,
  });
});

exports.pendingPassengers = catchAsync(async (req, res, next) => {
  const passengers = await Route.aggregate([
    {
      $unwind: "$passengers",
    },
    {
      $group: {
        _id: "$passengers",
      },
    },
  ]);

  const passengersIds = passengers.map((passenger) => passenger._id);

  const pendingPassengers = await User.find({
    _id: { $nin: passengersIds },
    role: { $ne: "driver" },
  });
  res.status(200).json({
    status: "Success",
    results: pendingPassengers.length,
    data: pendingPassengers,
  });
});

exports.rosteredPassengers = catchAsync(async (req, res, next) => {
  const passengers = await Route.aggregate([
    {
      $unwind: "$passengers",
    },
    {
      $group: {
        _id: "$passengers",
      },
    },
  ]);

  const passengersIds = passengers.map((passenger) => passenger._id);

  const rostered = await User.find({
    _id: { $in: passengersIds },
    role: { $ne: "driver" },
  });
  res.status(200).json({
    status: "Success",
    results: rostered.length,
    data: rostered,
  });
});

exports.driverRoute = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const route = await Route.find({ cab: id })
    .populate({ path: "cab", populate: { path: "cabDriver" } })
    .populate("passengers");
  if (!route)
    return next(new AppError(`No route for this driver id:${id}`, 404));
  res.status(200).json({ status: "Success", data: route });
});

exports.availableCabs = catchAsync(async (req, res, next) => {
  const cabs = await Cab.find({});
  const routes = await Route.find({});

  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  const curr_routes_no_capacity = routes.filter((route) => {
    const routeCreationDate = new Date(route.createdAt);
    routeCreationDate.setHours(0, 0, 0, 0);
    return (
      routeCreationDate.getTime() === currentDate.getTime() &&
      route.availableCapacity === 0
    );
  });
  const cab_not_available = curr_routes_no_capacity.map((route) => route.cab);
  const no_of_cabs_available = cabs.length - cab_not_available.length;
  res.status(200).json({ message: "Available Cabs", no_of_cabs_available });
});
