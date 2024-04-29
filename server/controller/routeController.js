const Cab = require("../models/cab");
const User = require("../models/user");
const Route = require("../models/route");
const { catchAsync } = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const assignCabToEmployees = (employees, cabs, workLocation, currentShift) => {
  const remainingEmployees = [...employees];
  const groups = [];

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
        route.workLocation === workLocation
      );
    });

    const cabPassengers = cabRoutesForShiftAndLocation.flatMap(
      (route) => route.passengers
    );
    const availableCapacity = cab.seatingCapacity - cabPassengers.length;
    if (availableCapacity <= 0) continue;

    const group = {
      cab: cab,
      passengers: [],
      availableCapacity,
    };

    // const matchingEmployees = remainingEmployees.filter(
    //   (employee) =>
    //     employee.workLocation === workLocation &&
    //     employee.currentShift === currentShift
    // );

    for (
      let i = 0;
      i < remainingEmployees.length && group.availableCapacity > 0;
      i++
    ) {
      group.passengers.push(remainingEmployees[i]);
      group.availableCapacity--;
    }

    remainingEmployees.splice(0, group.passengers.length);
    if (group.passengers.length === 0) continue;
    groups.push(group);
  }

  return groups;
};

exports.createShift = catchAsync(async (req, res, next) => {
  const { workLocation, currentShift, typeOfRoute, ref_coords } = req.body;

  // let ref_coords;
  // if (workLocation === "Rangreth")
  //   ref_coords = [34.001141168626624, 74.79347489627929];
  // else if (workLocation === "Zaira Tower")
  //   ref_coords = [34.17354072479764, 74.80831445395951];
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
      $addFields: {
        passengerCount: {
          $reduce: {
            input: {
              $filter: {
                input: "$routes",
                as: "route",
                cond: {
                  $and: [
                    { $eq: ["$$route.currentShift", currentShift] },
                    { $eq: ["$$route.workLocation", workLocation] },
                  ],
                },
              },
            },
            initialValue: 0,
            in: { $add: ["$$value", { $size: "$$this.passengers" }] },
          },
        },
      },
    },
    {
      $match: {
        $expr: { $lt: ["$passengerCount", "$seatingCapacity"] },
      },
    },
  ]);

  const groups = assignCabToEmployees(
    closestEmployees,
    cabs,
    workLocation,
    currentShift
  );

  res.status(200).json({
    status: "Success",
    data: groups,
    workLocation,
    currentShift,
    typeOfRoute,
  });
});

exports.createRoute = catchAsync(async (req, res, next) => {
  const { cabEmployeeGroups, workLocation, currentShift, typeOfRoute } =
    req.body;

  if (!Array.isArray(cabEmployeeGroups) || cabEmployeeGroups.length === 0)
    return next(new AppError(`Invalid or cabEmployeeGroups is empty`, 400));

  for (const group of cabEmployeeGroups) {
    const { cab, passengers } = group;
    const route = await Route.create({
      cab,
      passengers,
      workLocation,
      currentShift,
      typeOfRoute,
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
    .populate({ path: "passengers", select: "fname lname phone" });
  if (!routes) {
    return next(new AppError("No routes found...", 404));
  }
  res.status(200).json({ status: "Success", data: routes });
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
