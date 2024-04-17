const Cab = require("../models/cab");
const User = require("../models/user");
const Route = require("../models/route");
const { catchAsync } = require("../utils/catchAsync");

const createRoute = catchAsync(async function (req, res, next) {
  const { coordinates } = req.body;
  //1) aggregate user
  const employeeNearLocation = await User.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: coordinates,
        },
        distanceField: "distance",
        spherical: true,
        maxDistance: 1000,
      },
    },
    {
      $match: {
        workLocation: req.user.workLocation,
        currentShift: req.user.currentShift,
      },
    },
  ]);
});
//2) grouping employees into 6
const groupedEmployees = [];
let currentGroup = [];
employeeNearLocation.foreach((employee) => {
  if (!currentGroup.length || currentGroup.length >= 6) {
    currentGroup = [];
    groupedEmployees.push(currentGroup);
  }
  groupedEmployees.push(employee);
});
//3) getting available cabs
const availableCabs = await castObject
  .find({ seatingCapacity: 6 })
  .populate("cabDriver");
//4) creating cabs for each route
const createdRoutes = [];
for (const group of groupedEmployees) {
  const cabForGroup = availableCabs.shift();
  const newRoute = new Route({
    cab: cabForGroup._id,
    passengers: groupedEmployees.map((emp) => emp._id),
    shiftTime: req.user.currentShift,
    shiftDate: new Date().toISOString(),
    typeofRoute: "pickup",
    routeStatus: "notStarted",
    cabPath: [],
  });
  const savedRoutes = newRoute.save();
  createdRoutes.push(savedRoutes);
  res.status(200).json({ data: createdRoutes });
}
