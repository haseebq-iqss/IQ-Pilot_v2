const Cab = require("../models/cab");
const User = require("../models/user");
const Route = require("../models/route");
const { catchAsync } = require("../utils/catchAsync");

const assignCabToEmployees = (employees, cabs, workLocation, currentShift) => {
  const remainingEmployees = [...employees];
  const groups = [];

  for (const cab of cabs) {
    const cabRoutes = cab.routes.filter((route) =>
      route.currentShift.startsWith(currentShift.split("-")[0])
    );
    const cabPassengers = cabRoutes.flatMap((route) => route.passengers);
    const availableCapacity = cab.seatingCapacity - cabPassengers.length;

    if (availableCapacity <= 0) continue;

    const matchingEmployees = remainingEmployees.filter((employee) =>
      cabPassengers.every(
        (existingEmployee) =>
          existingEmployee.workLocation === workLocation &&
          existingEmployee.currentShift === currentShift
      )
    );

    if (matchingEmployees.length === 0) continue;

    const group = {
      cab: cab._id,
      passengers: [],
      availableCapacity,
      workLocation,
      currentShift,
    };

    for (
      let i = 0;
      i < matchingEmployees.length && group.availableCapacity > 0;
      i++
    ) {
      group.passengers.push(matchingEmployees[i]);
      group.availableCapacity--;
    }

    remainingEmployees.splice(0, group.passengers.length);
    groups.push(group);
  }

  return groups;
};

exports.createShift = catchAsync(async (req, res, next) => {
  const { workLocation, currentShift, ref_coords } = req.body;
  const closestEmployees = await User.aggregate([
    {
      $geoNear: {
        near: { type: "Point", coordinates: ref_coords },
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
                cond: { $eq: ["$$route.currentShift", currentShift] },
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
  console.log(cabs);

  res.status(200).json({
    status: "Success",
    // results: cabs.length,
    data: groups,
  });
});

exports.createRoute = catchAsync(async (req, res, next) => {
  const { cabEmployeeGroups, typeOfRoute, routeStatus } = req.body;

  if (!Array.isArray(cabEmployeeGroups) || cabEmployeeGroups.length === 0)
    return next(new AppError(`Invalid or cabEmployeeGroups is empty`, 400));

  for (const group of cabEmployeeGroups) {
    const { cab, workLocation, currentShift, passengers } = group;
    const route = await Route.create({
      cab,
      passengers,
      workLocation,
      currentShift,
      typeOfRoute,
      routeStatus,
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
