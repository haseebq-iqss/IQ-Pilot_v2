const Cab = require("../models/cab");
const User = require("../models/user");
const Route = require("../models/route");
const { catchAsync } = require("../utils/catchAsync");

const createRoute = catchAsync(async (req, res, next) => {
  const { coordinates, workLocation, currentShift } = req.body;

  // 1) Aggregating to find employees near the given coordinates
  const employeesNearLocation = await User.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: coordinates,
        },
        distanceField: "distance",
        distanceMultiplier: 0.001,
        spherical: true,
        maxDistance: 10000, // Maximum distance in meters with respect to the given coordinates from req.body
      },
    },
    {
      $match: {
        workLocation,
        currentShift,
      },
    },
  ]);
  // console.log(employeesNearLocation);

  //2) Grouping nearby employees into suitable groups with a maximum of 6 employees per group

  const groupedEmployees = [];
  let currentGroup = [];

  employeesNearLocation.forEach((employee) => {
    if (!currentGroup.length || currentGroup.length >= 6) {
      currentGroup = [];
      groupedEmployees.push(currentGroup);
      console.log(groupedEmployees);
    }
    currentGroup.push(employee);
  });

  //3) getting available cabs with a seating capacity of 6

  const availableCabs = await Cab.find({ seatingCapacity: 6 }).populate(
    "cabDriver"
  );

  // 4) Creating routes for each group with corresponding cabs

  const createdRoutes = [];

  for (const group of groupedEmployees) {
    const cabForGroup = availableCabs.shift();
    console.log(cabForGroup);
    const newRoute = await Route.create({
      cab: cabForGroup._id,
      passengers: group.map((emp) => emp._id),
      shiftTime: currentShift,
      shiftDate: new Date().toISOString(),
      typeofRoute: "pickup",
      routeStatus: "notStarted",
      cabPath: [],
    });
    createdRoutes.push(newRoute);
  }

  res.status(201).json({
    status: "success",
    data: createdRoutes,
  });
});

module.exports = { createRoute };
