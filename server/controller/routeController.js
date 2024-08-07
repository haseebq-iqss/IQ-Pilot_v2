const Cab = require("../models/cab");
const User = require("../models/user");
const Route = require("../models/route");
const { catchAsync } = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const getActiveRoutes = require("../utils/activeRoutesFun");
const shuffleArray = require("../utils/shuffleArray");
const setMonthTimeLine = require("../utils/setMonthTimeLine");
const kmeans = require("node-kmeans");
const {
  euclidian_distance,
  squaredDistance,
} = require("../utils/euclidianDistance");

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
      continue;
    }

    // CHECK FOR CONFLICTING ROUTES
    const conflicting_routes = cab.routes.some((route) => {
      const [route_start, route_end] = route.currentShift.split("-");
      const [new_route_start, new_route_end] = currentShift.split("-");

      return (
        route_start === new_route_start && route.typeOfRoute === typeOfRoute
      );
    });

    // console.log(conflicting_routes);
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
  const {
    workLocation,
    currentShift,
    typeOfRoute,
    ref_coords,
    daysRouteIsActive,
  } = req.body;
  const PROXIMITY_THRESHOLD = 10;
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
  // console.log(closestEmployees.length);

  if (closestEmployees.length === 0)
    return next(
      new AppError(
        `No employees found as of now for this shift: ${currentShift} and workLocation: ${workLocation}`,
        404
      )
    );

  const routes = await Route.find({});
  // CHECK FOR ACTIVE ROUTES
  if (routes.length >= 1) {
    const active_routes = await getActiveRoutes(routes);
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
          `Team Members for this shift: ${currentShift} and work-loction: ${workLocation} are already rostered!`,
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

  if (cabs.length === 0)
    return next(new AppError(`No cabs available as of now...`, 404));

  // NOT TO PUSH NON-ACTIVE ROUTES ROUTES ARRAY IN EACH CABS(FILTERING OF CABS)
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
    workLocation,
    currentShift,
    typeOfRoute,
    daysRouteIsActive,
  });
});

function kmeansPlusPlusInitialization(data, k) {
  const centroids = [];

  // Choose the first centroid randomly
  centroids.push(data[Math.floor(Math.random() * data.length)]);

  for (let i = 1; i < k; i++) {
    const distances = data.map((point) => {
      const minDistance = Math.min(
        ...centroids.map((centroid) => squaredDistance(point, centroid))
      );
      return minDistance;
    });

    const sumDistances = distances.reduce((sum, distance) => sum + distance, 0);
    const probabilities = distances.map((distance) => distance / sumDistances);

    const randomValue = Math.random();
    let cumulativeProbability = 0;
    for (let j = 0; j < probabilities.length; j++) {
      cumulativeProbability += probabilities[j];
      if (randomValue <= cumulativeProbability) {
        centroids.push(data[j]);
        break;
      }
    }
  }

  return centroids;
}

// exports.createShiftKM = catchAsync(async (req, res, next) => {
//   const present_day = new Date();
//   present_day.setHours(0, 0, 0, 0);

//   const {
//     workLocation,
//     currentShift,
//     typeOfRoute,
//     daysRouteIsActive,
//     activationMode,
//   } = req.body;

//   const employees = await User.find({ workLocation, currentShift });
//   if (employees.length === 0)
//     return next(
//       new AppError(
//         `No employees found for this shift:${currentShift} and workloction:${workLocation}`
//       )
//     );

//   const employeesPickUpCoordinates = employees.map(
//     (employee) => employee.pickUp.coordinates
//   );

//   const routes = await Route.find({});
//   // CHECK FOR ACTIVE ROUTES
//   if (routes.length >= 1) {
//     const active_routes = await getActiveRoutes(routes);
//     const check_active_routes = active_routes.find((route) => {
//       return (
//         route.workLocation === workLocation &&
//         route.currentShift === currentShift &&
//         route.typeOfRoute === typeOfRoute
//       );
//     });

//     if (check_active_routes)
//       return next(
//         new AppError(
//           `Team Members for this shift: ${currentShift} and work-loction: ${workLocation} are already rostered!`,
//           400
//         )
//       );
//   }

//   const numOfClusters = Math.ceil(employees.length / 6);
//   const initialCentroids = kmeansPlusPlusInitialization(
//     employeesPickUpCoordinates,
//     numOfClusters
//   );

//   kmeans.clusterize(
//     employeesPickUpCoordinates,
//     { k: numOfClusters, initialize: initialCentroids },
//     async (err, resClusters) => {
//       let employeesSortedByPickCoords = [];
//       for (const cluster of resClusters) {
//         const clusterCentroid = cluster.centroid;
//         const sortedCluster = cluster.clusterInd
//           .map((ind) => ({
//             employee: employees[ind],
//             distance: euclidian_distance(
//               clusterCentroid,
//               employeesPickUpCoordinates[ind]
//             ),
//           }))
//           .sort((a, b) => a.distance - b.distance)
//           .map((obj) => obj.employee);

//         employeesSortedByPickCoords.push(...sortedCluster);
//       }
//       if (employeesSortedByPickCoords.length === 0)
//         return next(
//           new AppError(
//             `No employees found as of now for this shift: ${currentShift} and workLocation: ${workLocation}`,
//             404
//           )
//         );

//       const routes = await Route.find({});
//       // CHECK FOR ACTIVE ROUTES
//       if (routes.length >= 1) {
//         const active_routes = await getActiveRoutes(routes);
//         const check_active_routes = active_routes.find((route) => {
//           return (
//             route.workLocation === workLocation &&
//             route.currentShift === currentShift &&
//             route.typeOfRoute === typeOfRoute
//           );
//         });

//         if (check_active_routes)
//           return next(
//             new AppError(
//               `Team Members for this shift: ${currentShift} and work-loction: ${workLocation} are already rostered!`,
//               400
//             )
//           );
//       }

//       const cabs = await Cab.aggregate([
//         {
//           $lookup: {
//             from: "routes",
//             foreignField: "cab",
//             localField: "_id",
//             as: "routes",
//           },
//         },
//         {
//           $lookup: {
//             from: "users",
//             foreignField: "_id",
//             localField: "cabDriver",
//             as: "cabDriver",
//           },
//         },
//       ]);

//       if (cabs.length === 0)
//         return next(new AppError(`No cabs available as of now...`, 404));

//       // NOT TO PUSH NON-ACTIVE ROUTES ROUTES ARRAY IN EACH CABS(FILTERING OF CABS)
//       for (const cab of cabs) {
//         cab.routes = cab.routes
//           .map((route) => {
//             const route_created = new Date(route.createdAt);
//             route_created.setHours(0, 0, 0, 0);
//             const end_date = new Date(route.createdAt);
//             end_date.setDate(route_created.getDate() + route.daysRouteIsActive);
//             end_date.setHours(0, 0, 0, 0);
//             if (
//               route_created.getTime() < present_day.getTime() &&
//               end_date.getTime() < present_day.getTime()
//             )
//               return null;
//             return route;
//           })
//           .filter((val) => val !== null);
//       }

//       const groups = await assignCabToEmployees(
//         workLocation,
//         currentShift,
//         typeOfRoute,
//         employeesSortedByPickCoords,
//         cabs
//       );

//       res.status(200).json({
//         message: "Success",
//         results: groups.length,
//         data: groups,
//         workLocation,
//         currentShift,
//         typeOfRoute,
//         daysRouteIsActive,
//         activationMode,
//       });
//     }
//   );
// });

// exports.createRoute = catchAsync(async (req, res, next) => {
//   const {
//     cabEmployeeGroups,
//     workLocation,
//     currentShift,
//     typeOfRoute,
//     daysRouteIsActive,
//     activationMode,
//   } = req.body;

//   if (!Array.isArray(cabEmployeeGroups) || cabEmployeeGroups.length === 0)
//     return next(new AppError(`Invalid or cabEmployeeGroups is empty`, 400));

//   const baseDate = new Date(
//     Date.UTC(
//       new Date().getUTCFullYear(),
//       new Date().getUTCMonth(),
//       new Date().getUTCDate()
//     )
//   );
//   const routesToCreate = [];

//   for (const group of cabEmployeeGroups) {
//     const { cab, passengers, availableCapacity } = group;

//     for (let i = 0; i < daysRouteIsActive; i++) {
//       const dateActive = new Date(baseDate);
//       if (activationMode === "immediate") {
//         dateActive.setUTCDate(baseDate.getUTCDate() + i);
//         routesToCreate.push({
//           cab,
//           passengers,
//           workLocation,
//           currentShift,
//           typeOfRoute,
//           availableCapacity,
//           daysRouteIsActive,
//           activeOnDate: dateActive,
//         });
//       } else {
//         dateActive.setUTCDate(baseDate.getUTCDate() + i + 1);
//         routesToCreate.push({
//           cab,
//           passengers,
//           workLocation,
//           currentShift,
//           typeOfRoute,
//           availableCapacity,
//           daysRouteIsActive,
//           activeOnDate: dateActive,
//         });
//       }
//     }
//   }
//   await Route.insertMany(routesToCreate);
//   res.status(201).json({
//     status: "Success",
//     message: "Shifts confirmed and routes created successfully",
//   });
// });

exports.createShiftKM = catchAsync(async (req, res, next) => {
  const present_day = new Date();
  present_day.setHours(0, 0, 0, 0);
  let nextAvailableStartDate;

  const {
    workLocation,
    currentShift,
    typeOfRoute,
    daysRouteIsActive,
    activationMode,
  } = req.body;

  const employees = await User.find({ workLocation, currentShift });
  if (employees.length === 0)
    return next(
      new AppError(
        `No employees found for this shift:${currentShift} and workloction:${workLocation}`
      )
    );

  const employeesPickUpCoordinates = employees.map(
    (employee) => employee.pickUp.coordinates
  );

  const routes = await Route.find({});
  // CHECK FOR ACTIVE ROUTES
  // if (routes.length >= 1) {
  //   const active_routes = await getActiveRoutes(routes);
  //   const check_active_routes = active_routes.find((route) => {
  //     return (
  //       route.workLocation === workLocation &&
  //       route.currentShift === currentShift &&
  //       route.typeOfRoute === typeOfRoute
  //     );
  //   });

  //   if (check_active_routes)
  //     return next(
  //       new AppError(
  //         `Team Members for this shift: ${currentShift} and work-loction: ${workLocation} are already rostered!`,
  //         400
  //       )
  //     );
  // }
  if (routes.length >= 1) {
    const active_routes = await getActiveRoutes(routes);
    const filter_active_routes = active_routes.filter((route) => {
      return (
        route.workLocation === workLocation &&
        route.currentShift === currentShift &&
        route.typeOfRoute === typeOfRoute
      );
    });

    let latest_active_routes;
    if (filter_active_routes.length != 0) {
      latest_active_routes = filter_active_routes.sort(
        (a, b) => b.activeOnDate - a.activeOnDate
      );
      nextAvailableStartDate = new Date(latest_active_routes[0].activeOnDate);
      nextAvailableStartDate.setDate(nextAvailableStartDate.getDate() + 1);
    }
  }

  const numOfClusters = Math.ceil(employees.length / 6);
  const initialCentroids = kmeansPlusPlusInitialization(
    employeesPickUpCoordinates,
    numOfClusters
  );

  kmeans.clusterize(
    employeesPickUpCoordinates,
    { k: numOfClusters, initialize: initialCentroids },
    async (err, resClusters) => {
      let employeesSortedByPickCoords = [];
      for (const cluster of resClusters) {
        const clusterCentroid = cluster.centroid;
        const sortedCluster = cluster.clusterInd
          .map((ind) => ({
            employee: employees[ind],
            distance: euclidian_distance(
              clusterCentroid,
              employeesPickUpCoordinates[ind]
            ),
          }))
          .sort((a, b) => a.distance - b.distance)
          .map((obj) => obj.employee);

        employeesSortedByPickCoords.push(...sortedCluster);
      }
      if (employeesSortedByPickCoords.length === 0)
        return next(
          new AppError(
            `No employees found as of now for this shift: ${currentShift} and workLocation: ${workLocation}`,
            404
          )
        );

      // const routes = await Route.find({});
      // // CHECK FOR ACTIVE ROUTES
      // if (routes.length >= 1) {
      //   const active_routes = await getActiveRoutes(routes);
      //   const check_active_routes = active_routes.find((route) => {
      //     return (
      //       route.workLocation === workLocation &&
      //       route.currentShift === currentShift &&
      //       route.typeOfRoute === typeOfRoute
      //     );
      //   });

      //   if (check_active_routes)
      //     return next(
      //       new AppError(
      //         `Team Members for this shift: ${currentShift} and work-loction: ${workLocation} are already rostered!`,
      //         400
      //       )
      //     );
      // }

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

      if (cabs.length === 0)
        return next(new AppError(`No cabs available as of now...`, 404));

      // NOT TO PUSH NON-ACTIVE ROUTES ROUTES ARRAY IN EACH CABS(FILTERING OF CABS)
      for (const cab of cabs) {
        cab.routes = cab.routes
          .map((route) => {
            const route_created = new Date(route.createdAt);
            route_created.setHours(0, 0, 0, 0);
            const end_date = new Date(route.createdAt);
            end_date.setDate(route_created.getDate() + route.daysRouteIsActive);
            end_date.setHours(0, 0, 0, 0);
            if (
              (route_created.getTime() < present_day.getTime() &&
                end_date.getTime() < present_day.getTime()) ||
              present_day.getTime() < nextAvailableStartDate?.getTime()
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
        employeesSortedByPickCoords,
        cabs
      );

      res.status(200).json({
        message: "Success",
        results: groups.length,
        data: groups,
        workLocation,
        currentShift,
        typeOfRoute,
        daysRouteIsActive,
        activationMode,
        nextAvailableStartDate,
      });
    }
  );
});

exports.createRoute = catchAsync(async (req, res, next) => {
  const {
    cabEmployeeGroups,
    workLocation,
    currentShift,
    typeOfRoute,
    daysRouteIsActive,
    activationMode,
    nextAvailableStartDate,
  } = req.body;

  if (!Array.isArray(cabEmployeeGroups) || cabEmployeeGroups.length === 0)
    return next(new AppError(`Invalid or cabEmployeeGroups is empty`, 400));

  // const baseDate = new Date(
  //   Date.UTC(
  //     new Date().getUTCFullYear(),
  //     new Date().getUTCMonth(),
  //     new Date().getUTCDate()
  //   )
  // );
  const routesToCreate = [];
  const baseDate = nextAvailableStartDate
    ? new Date(nextAvailableStartDate)
    : new Date(
        Date.UTC(
          new Date().getUTCFullYear(),
          new Date().getUTCMonth(),
          new Date().getUTCDate()
        )
      );

  // console.log(baseDate);

  for (const group of cabEmployeeGroups) {
    const { cab, passengers, availableCapacity } = group;

    for (let i = 0; i < daysRouteIsActive; i++) {
      const dateActive = new Date(baseDate);
      if (activationMode === "immediate") {
        dateActive.setUTCDate(baseDate.getUTCDate() + i);
        routesToCreate.push({
          cab,
          passengers,
          workLocation,
          currentShift,
          typeOfRoute,
          availableCapacity,
          daysRouteIsActive,
          activeOnDate: dateActive,
        });
      } else {
        dateActive.setUTCDate(baseDate.getUTCDate() + i + 1);
        routesToCreate.push({
          cab,
          passengers,
          workLocation,
          currentShift,
          typeOfRoute,
          availableCapacity,
          daysRouteIsActive,
          activeOnDate: dateActive,
        });
      }
    }
  }
  await Route.insertMany(routesToCreate);
  res.status(201).json({
    status: "Success",
    message: "Shifts confirmed and routes created successfully",
  });
});

exports.getRoute = catchAsync(async (req, res, next) => {
  const route = await Route.findById(req.params.id)
    .populate({
      path: "cab passengers",
    })
    .select("+cabPath");
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
  const active_routes = await getActiveRoutes(all_routes);
  const active_routes_not_completed = active_routes.filter(
    (active_route) => active_route.routeStatus !== "completed"
  );

  if (active_routes_not_completed.length === 0) {
    return res
      .status(200)
      .json({ message: "No active routes found as of now..." });
  }

  res.status(200).json({
    status: "Success",
    results: active_routes_not_completed.length,
    data: active_routes_not_completed,
  });
});

exports.getTodayRoute = catchAsync(async (req, res, next) => {
  const startDate = new Date(
    Date.UTC(
      new Date().getUTCFullYear(),
      new Date().getUTCMonth(),
      new Date().getUTCDate()
    )
  );
  const todayRoute = await Route.find({
    activeOnDate: {
      $eq: startDate,
    },
  }).populate({
    path: "cab",
    populate: { path: "cabDriver" },
  })
  .populate("passengers");
  res
    .status(200)
    .json({ message: "Success", results: todayRoute.length, todayRoute });
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

exports.deleteRoute = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  // console.log(id);
  const deleted_route = await Route.findByIdAndDelete(id);
  if (!deleted_route)
    return next(new AppError(`No route found for this id: ${id}`, 404));

  res.status(200).json({ status: "Success", data: deleted_route });
});

exports.pendingPassengers = catchAsync(async (req, res, next) => {
  const all_routes = await Route.find({})
    .populate({
      path: "cab",
      populate: { path: "cabDriver" },
    })
    .populate("passengers");
  const active_routes = await getActiveRoutes(all_routes);

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
  const active_routes = await getActiveRoutes(all_routes);

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
  const pickArr = [];
  const dropArr = [];

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

  const active_routes = await getActiveRoutes(cab_all_routes);
  if (active_routes.length === 0)
    return next(
      new AppError(`No active routes assigned to this cab: ${cab_id}`, 404)
    );

  active_routes.forEach((route) => {
    if (route.typeOfRoute === "pickup" && route.routeStatus !== "completed")
      pickArr.push(route);
    else if (route.typeOfRoute === "drop" && route.routeStatus !== "completed")
      dropArr.push(route);
  });

  res.status(200).json({ status: "Success", data: { pickArr, dropArr } });
});

exports.totalDistanceMonth = catchAsync(async (req, res, next) => {
  const [firstDayMonth, firstDayNextMonth] = setMonthTimeLine();

  const routes = await Route.find({
    createdAt: {
      $gte: firstDayMonth,
      $lt: firstDayNextMonth,
    },
  });

  const total_distance = routes.reduce(
    (acc, route) => (route.totalDistance ? acc + route.totalDistance : acc),
    0
  );
  res
    .status(200)
    .json({ status: "Success", data: Number(total_distance.toFixed(2)) });
});

exports.driverRoutesForMonth = catchAsync(async (req, res, next) => {
  const [firstDayMonth, firstDayNextMonth] = setMonthTimeLine();

  const pickArr = [];
  const dropArr = [];

  const id = req.params.id;
  const cab = await Cab.findOne({
    cabDriver: id,
  });
  if (!cab)
    return next(new AppError(`No cab found with this driver id: ${id}`, 404));

  const { _id: cab_id } = cab;

  const cab_all_routes = await Route.find({
    cab: cab_id,
    createdAt: { $gte: firstDayMonth, $lt: firstDayNextMonth },
  })
    .populate({
      path: "cab",
      populate: "cabDriver",
    })
    .populate("passengers");

  if (cab_all_routes.length === 0)
    return next(new AppError(`No routes assigned to this cab: ${cab_id}`, 404));

  cab_all_routes.forEach((route) => {
    if (route.typeOfRoute === "pickup") pickArr.push(route);
    else if (route.typeOfRoute === "drop") dropArr.push(route);
  });

  res.status(200).json({ status: "Success", data: { pickArr, dropArr } });
});
