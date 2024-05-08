const Cab = require("../models/cab");
const User = require("../models/user");
const Route = require("../models/route");
const { catchAsync } = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const assignCabToEmployees = async (
  employees,
  cabs,
  workLocation,
  currentShift
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
        route.workLocation === workLocation
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
    {
      $lookup: {
        from: "users",
        localField: "cabDriver",
        foreignField: "_id",
        as: "cabDriver",
      },
    },
  ]);

  const groups = await assignCabToEmployees(
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

const assignCabToEmployeesForCentroidShift = async (
  employees,
  cabs,
  workLocation,
  currentShift
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
        route.workLocation === workLocation
      );
    });

    let cabPassengers = cabRoutesForShiftAndLocation.flatMap(
      (route) => route.passengers
    );
    const populatedPassengers = await Promise.all(
      cabPassengers.map(async (passengerID) => {
        try {
          if (passengerID) {
            passengerID ? assignedEmployees.add(passengerID.toString()) : "";
            const user = User.findById(passengerID);
            return user;
          }
          return null;
        } catch (err) {
          console.log(
            `Error fetching user for passenger ID ${passengerID}: ${err}`
          );
          return null;
        }
      })
    );
    cabPassengers = populatedPassengers.filter((val) => val !== null);

    const availableCapacity = cab.seatingCapacity - cabPassengers.length;
    const slicePara = remainingEmployees.length - availableCapacity;
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

    remainingEmployees.splice(0, slicePara);
    if (group.passengers.length === 0) continue;
    groups.push(group);
  }
  return groups;
};

function calculateCentroid(coordinates) {
  if (coordinates.length === 0) {
    return null; // Return null if there are no coordinates
  }

  let totalLatitude = 0;
  let totalLongitude = 0;

  // Calculate the sum of latitude and longitude values
  coordinates.forEach((coord) => {
    totalLatitude += coord[1]; // Latitude is the second element in [longitude, latitude] format
    totalLongitude += coord[0]; // Longitude is the first element
  });

  // Calculate the average latitude and longitude
  const avgLatitude = totalLatitude / coordinates.length;
  const avgLongitude = totalLongitude / coordinates.length;

  return [avgLongitude, avgLatitude]; // Return the centroid as [longitude, latitude]
}

exports.createShiftByCentroid = catchAsync(async (req, res, next) => {
  const { workLocation, currentShift, typeOfRoute, ref_coords } = req.body;
  let filtered_employees, employees;
  let workLocationCoords;

  if (workLocation === "Rangreth")
    workLocationCoords = [34.001114485156826, 74.79347489627929];
  else if (workLocation === "Zaira Tower")
    workLocationCoords = [34.173576230372845, 74.80828226745076];

  const employeesSameShift = await User.find({
    workLocation,
    currentShift,
    role: { $ne: "driver" },
  });

  const coordinates = employeesSameShift.map(
    (employee) => employee.pickUp.coordinates
  );

  const centroid = calculateCentroid([...coordinates, workLocationCoords]);

  const closestEmployees = await User.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: centroid,
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

  const routes = await Route.find({});
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  if (routes.length > 0) {
    const routesForCurrentDate = routes.filter((route) => {
      const routeCreatedAt = new Date(route.createdAt);
      routeCreatedAt.setHours(0, 0, 0, 0);
      // console.log(routeCreatedAt.getTime(), currentDate.getTime());
      return (
        routeCreatedAt.getTime() === currentDate.getTime() &&
        route.workLocation === workLocation &&
        route.currentShift === currentShift
      );
    });
    console.log(routesForCurrentDate);
    if (routesForCurrentDate.length !== 0)
      return res.status(401).json({
        message:
          "Routes already exist for the current date, current shift, and work location. Employees are already assigned for this shift.",
      });

    // const passengersInRoutesIds = await Route.aggregate([
    //   {
    //     $match: {
    //       workLocation,
    //       currentShift,
    //       typeOfRoute: "pickup",
    //       createdAt: { $eq: currentDate },
    //     },
    //   },
    //   {
    //     $unwind: "$passengers",
    //   },
    //   {
    //     $group: {
    //       _id: "$passengers",
    //     },
    //   },
    // ]);

    // const passengersInRoutes = await Promise.all(
    //   passengersInRoutesIds.map(async (passenger) =>
    //     User.findById(passenger._id)
    //   )
    // );
    // employees = passengersInRoutes;
  }
  // console.log(employees.length);
  // employees =
  //   employees.length === 0
  //     ? closestEmployees
  //     : closestEmployees.splice(0, employees.length) && closestEmployees;

  // console.log(employees);
  //   if (employees.length === 0) {
  //     return res.status(401).json({
  //       message: "For this shift,employees are already assigned a cab...",
  //     });
  // }
  // console.log(closestEmployees);
  const cabs = await Cab.aggregate([
    {
      $lookup: {
        from: "routes",
        foreignField: "cab",
        localField: "_id",
        as: "routes",
      },
    },
    // {
    //   $addFields: {
    //     passengerCount: {
    //       $reduce: {
    //         input: {
    //           $filter: {
    //             input: "$routes",
    //             as: "route",
    //             cond: {
    //               $and: [
    //                 { $eq: ["$$route.currentShift", currentShift] },
    //                 { $eq: ["$$route.workLocation", workLocation] },
    //               ],
    //             },
    //           },
    //         },
    //         initialValue: 0,
    //         in: { $add: ["$$value", { $size: "$$this.passengers" }] },
    //       },
    //     },
    //   },
    // },
    // {
    //   $match: {
    //     $expr: { $lt: ["$passengerCount", "$seatingCapacity"] },
    //   },
    // },
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
    // console.log(cab);
  }

  const groups = await assignCabToEmployeesForCentroidShift(
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
