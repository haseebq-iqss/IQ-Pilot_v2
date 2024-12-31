const Cab = require("../models/cab");
const User = require("../models/user");
const Route = require("../models/route");
const { catchAsync } = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const getActiveRoutes = require("../utils/activeRoutesFun");
const shuffleArray = require("../utils/shuffleArray");
const setMonthTimeLine = require("../utils/setMonthTimeLine");
const kmeans = require("node-kmeans");
const geolib = require("geolib");
const clustering = require("density-clustering");

const {
  euclidian_distance,
  squaredDistance,
} = require("../utils/euclidianDistance");

const {
  prepareShiftDataForExport,
  exportShiftDataToExcel,
} = require("../utils/exportShiftDataFun");

function kmeansPlusPlusInitialization(data, k) {
  // Edge Case: Check if data is empty
  if (!data || data.length === 0) {
    throw new Error("Data is empty. Cannot initialize centroids.");
  }

  // Edge Case: Check if k is greater than the number of data points
  if (k > data.length) {
    throw new Error(
      "Number of centroids (k) cannot be greater than the number of data points."
    );
  }

  const centroids = [];

  // Choose the first centroid randomly
  centroids.push(data[Math.floor(Math.random() * data.length)]);

  for (let i = 1; i < k; i++) {
    // Calculate distance from each point to the nearest centroid
    const distances = data.map((point) => {
      const minDistance = Math.min(
        ...centroids.map((centroid) => squaredDistance(point, centroid))
      );
      return minDistance;
    });

    // Handle Edge Case: If all points are identical
    const uniqueDistances = new Set(distances);
    if (uniqueDistances.size === 1) {
      throw new Error(
        "All data points are identical. Cannot properly initialize centroids."
      );
    }

    // Normalize distances to get probabilities
    const sumDistances = distances.reduce((sum, distance) => sum + distance, 0);
    if (sumDistances === 0) {
      throw new Error(
        "Sum of distances is zero. This might be due to identical data points."
      );
    }

    const probabilities = distances.map((distance) => distance / sumDistances);

    // Select the next centroid based on the probabilities
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

const calculateDynamicEpsilon = (coordinates) => {
  const distances = [];
  for (let i = 0; i < coordinates.length; i++) {
    for (let j = i + 1; j < coordinates.length; j++) {
      distances.push(
        geolib.getDistance(
          { latitude: coordinates[i][1], longitude: coordinates[i][0] },
          { latitude: coordinates[j][1], longitude: coordinates[j][0] }
        )
      );
    }
  }
  distances.sort((a, b) => a - b);
  return distances[Math.floor(distances.length * 0.1)]; // Use the 10th percentile distance
};

function assignCabs(
  cabs,
  remaining_employees,
  currentShift,
  assigned_employees,
  groups
) {
  for (const cab of cabs) {
    if (remaining_employees.length === 0) break;

    // if (cab.routes.length === 2) {
    //   console.log(`Cab has already been assigned with two routes`);
    //   continue;
    // }

    if (cab.routes.length > 1) {
      const flag = cab.routes.some((route) => {
        // console.log(
        //   parseInt(currentShift) - parseInt(route.currentShift.split(":")[0])
        // );
        return (
          parseInt(currentShift) - parseInt(route.currentShift.split(":")[0]) <=
          1
        );
      });
      if (flag) continue;
    }

    // CHECK FOR CONFLICTING ROUTES
    const conflicting_routes = cab.routes.some(
      (route) => route.currentShift === currentShift
    );
    // console.log(conflicting_routes);
    if (conflicting_routes) {
      console.log(
        `Cab ${cab._id} already has a route for shift: ${currentShift}.`
      );
      continue;
    }

    const group = {
      cab,
      passengers: [],
      availableCapacity: cab.seatingCapacity,
    };
    // for (
    //   let i = 0;
    //   i < remaining_employees.length && group.availableCapacity > 0;
    //   i++
    // ) {
    //   const employee = remaining_employees[i];
    //   if (!assigned_employees.has(employee._id.toString())) {
    //     group.passengers.push(employee);
    //     group.availableCapacity--;
    //     assigned_employees.add(employee._id.toString());
    //     remaining_employees.splice(i, 1);

    //     i--;
    //   }
    // }
    let i = 0;
    while (i < remaining_employees.length && group.availableCapacity > 0) {
      const employee = remaining_employees[i];
      if (!assigned_employees.has(employee._id.toString())) {
        group.passengers.push(employee);
        group.availableCapacity--;
        assigned_employees.add(employee._id.toString());
        remaining_employees.splice(i, 1); // Mutates the array
        // console.log(`✅ Assigned Employee ${employee._id} to Cab ${cab._id}`);
      } else {
        i++;
      }
    }
    if (group.passengers.length > 0) {
      groups.push(group);
    }
    // } else console.log(`No passengers assigned to cab ${cab._id}`);
  }
  // console.log(remaining_employees.length);
}

const assignCabToEmployees = async (currentShift, employees, cabs) => {
  if (!Array.isArray(employees) || !Array.isArray(cabs))
    throw new AppError(`Invalid input: employees and cabs must be arrays.`);

  if (!employees.length || !cabs.length) {
    // console.log("No employees or cabs available for this shift.");
    return [];
  }

  const remaining_employees = [...employees];
  const groups = [];

  const assigned_employees = new Set();
  const shuffled_cabs = shuffleArray(cabs);

  const in_house_cabs = shuffled_cabs.filter(
    (cab) => cab.typeOfCab === "inHouse"
  );
  const vendor_cabs = shuffled_cabs.filter((cab) => cab.typeOfCab === "vendor");

  assignCabs(
    in_house_cabs,
    remaining_employees,
    currentShift,
    assigned_employees,
    groups
  );

  if (remaining_employees.length > 0)
    assignCabs(
      vendor_cabs,
      remaining_employees,
      currentShift,
      assigned_employees,
      groups
    );
  return groups;
};

exports.createShiftKM = catchAsync(async (req, res, next) => {
  const present_day = new Date(
    Date.UTC(
      new Date().getUTCFullYear(),
      new Date().getUTCMonth(),
      new Date().getUTCDate()
    )
  );

  const { workLocation, currentShift, typeOfRoute } = req.body;

  const date_active = new Date(present_day);
  date_active.setUTCDate(present_day.getUTCDate() + 1);

  let existing_routes = await Route.find({
    typeOfRoute,
    workLocation,
    currentShift,
    activeOnDate: typeOfRoute === "pickup" ? date_active : present_day,
  });

  if (existing_routes.length !== 0) {
    return next(
      new AppError(
        `A ${typeOfRoute} route already exists for shift ${currentShift} and workLocation: ${workLocation} on ${date_active.toISOString()}`
      )
    );
  }

  const employees = await User.aggregate([
    {
      $match: {
        workLocation: { $eq: workLocation },
        isCabCancelled: { $eq: false },
        hasCabService: { $eq: true },
        $expr: {
          $cond: {
            if: { $eq: [typeOfRoute, "pickup"] },
            then: {
              $eq: [
                { $arrayElemAt: [{ $split: ["$currentShift", "-"] }, 0] },
                currentShift,
              ],
            },
            else: {
              $eq: [
                { $arrayElemAt: [{ $split: ["$currentShift", "-"] }, 1] },
                currentShift,
              ],
            },
          },
        },
      },
    },
  ]);

  if (employees.length === 0)
    return next(
      new AppError(
        `No employees found for this shift:${currentShift} and workloction:${workLocation}`
      )
    );

  const employeesPickUpCoordinates = employees.map(
    (employee) => employee.pickUp.coordinates
  );

  // Using DBSCAN for grouping employees into clusters.
  const dbscan = new clustering.DBSCAN();
  const EPSILON = 3000;
  const MIN_POINTS = 4;
  const MAX_CAB_CAPACITY = 6;

  const clusters = dbscan.run(
    employeesPickUpCoordinates,
    EPSILON,
    MIN_POINTS,
    (p1, p2) => {
      return (
        geolib.getDistance(
          { latitude: p1[1], longitude: p1[0] },
          { latitude: p2[1], longitude: p2[0] }
        ) * 1.25
      );
    }
  );
  let employeesSortedByPickCoords = [];
  for (const cluster of clusters) {
    const clusterCoords = cluster.map((ind) => employeesPickUpCoordinates[ind]);
    const clusterEmployees = cluster.map((index) => employees[index]);

    if (cluster.length > MAX_CAB_CAPACITY) {
      const kmeans = new clustering.KMEANS();
      const numOfClusters = Math.ceil(cluster.length / MAX_CAB_CAPACITY);
      const kmeansClusters = kmeans.run(clusterCoords, numOfClusters);
      for (const subCluster of kmeansClusters) {
        const sortedSubCluster = subCluster
          .map((index) => clusterEmployees[index])
          .sort((a, b) =>
            geolib.getDistance(
              {
                latitude: a.pickUp.coordinates[1],
                longitude: a.pickUp.coordinates[0],
              },
              {
                latitude: b.pickUp.coordinates[1],
                longitude: b.pickUp.coordinates[0],
              }
            )
          );
        employeesSortedByPickCoords.push(...sortedSubCluster);
      }
    } else {
      // For small clusters, sort directly
      const sortedCluster = clusterEmployees.sort((a, b) =>
        geolib.getDistance(
          {
            latitude: a.pickUp.coordinates[1],
            longitude: a.pickUp.coordinates[0],
          },
          {
            latitude: b.pickUp.coordinates[1],
            longitude: b.pickUp.coordinates[0],
          }
        )
      );
      employeesSortedByPickCoords.push(...sortedCluster);
    }
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
        const route_active_on_date = route.activeOnDate;
        // check this condition
        if (route_active_on_date.getTime() < present_day.getTime()) return null;
        return route;
      })
      .filter((val) => val !== null);
  }
  // cabs.routes = cabs.routes?.filter((route) => {
  //   return route.activeOnDate.getTime() >= present_day.getTime();
  // });

  const groups = await assignCabToEmployees(
    currentShift,
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
    scheduledForDate: typeOfRoute === "pickup" ? date_active : present_day,
  });

  // return res.status(200).json({ status: "Success", data: clusters });

  // USING K-MEANS CLUSTERING (OLD WAY).
  // const numOfClusters = Math.ceil(employees.length / 6);
  // const initialCentroids = kmeansPlusPlusInitialization(
  //   employeesPickUpCoordinates,
  //   numOfClusters
  // );
  // kmeans.clusterize(
  //   employeesPickUpCoordinates,
  //   { k: numOfClusters, initialize: initialCentroids },
  //   async (err, resClusters) => {
  //     if (err) {
  //       console.error("Clustering error: ", err);
  //       return next(new AppError("Clustering error occurred", 500));
  //     }
  //     let employeesSortedByPickCoords = [];
  //     for (const cluster of resClusters) {
  //       const clusterCentroid = cluster.centroid;
  //       // const sortedCluster = cluster.clusterInd
  //       //   .map((ind) => {
  //       //     const employee = employees[ind];
  //       //     const employeeCoords = employeesPickUpCoordinates[ind];
  //       //     // console.log(clusterCentroid[1], clusterCentroid[0]);
  //       //     const distance = geolib.getDistance(
  //       //       { latitude: clusterCentroid[1], longitude: clusterCentroid[0] },
  //       //       { latitude: employeeCoords[1], longitude: employeeCoords[0] }
  //       //     );
  //       //     // console.log(
  //       //     //   `Distance from centroid to employee ${ind}: ${distance} meters`
  //       //     // );
  //       //     return { employee, distance };
  //       //   })
  //       //   .filter((entry) => entry.distance <= RADIUS)
  //       //   .sort((a, b) => a.distance - b.distance)
  //       //   .map((obj) => obj.employee);

  //       const sortedCluster = cluster.clusterInd
  //         .map((ind) => ({
  //           employee: employees[ind],
  //           distance: euclidian_distance(
  //             clusterCentroid,
  //             employeesPickUpCoordinates[ind]
  //           ),
  //         }))
  //         .sort((a, b) => a.distance - b.distance)
  //         .map((obj) => obj.employee);

  //       employeesSortedByPickCoords.push(...sortedCluster);
  //     }

  //     if (employeesSortedByPickCoords.length === 0)
  //       return next(
  //         new AppError(
  //           `No employees found as of now for this shift: ${currentShift} and workLocation: ${workLocation}`,
  //           404
  //         )
  //       );
  //     const cabs = await Cab.aggregate([
  //       {
  //         $lookup: {
  //           from: "routes",
  //           foreignField: "cab",
  //           localField: "_id",
  //           as: "routes",
  //         },
  //       },
  //       {
  //         $lookup: {
  //           from: "users",
  //           foreignField: "_id",
  //           localField: "cabDriver",
  //           as: "cabDriver",
  //         },
  //       },
  //     ]);

  //     if (cabs.length === 0)
  //       return next(new AppError(`No cabs available as of now...`, 404));

  //     // NOT TO PUSH NON-ACTIVE ROUTES ROUTES ARRAY IN EACH CABS(FILTERING OF CABS)
  //     for (const cab of cabs) {
  //       cab.routes = cab.routes
  //         .map((route) => {
  //           const route_active_on_date = route.activeOnDate;
  //           // check this condition
  //           if (route_active_on_date.getTime() < present_day.getTime())
  //             return null;
  //           return route;
  //         })
  //         .filter((val) => val !== null);
  //     }
  //     // cabs.routes = cabs.routes?.filter((route) => {
  //     //   return route.activeOnDate.getTime() >= present_day.getTime();
  //     // });

  //     const groups = await assignCabToEmployees(
  //       currentShift,
  //       employeesSortedByPickCoords,
  //       cabs
  //     );

  //     res.status(200).json({
  //       message: "Success",
  //       results: groups.length,
  //       data: groups,
  //       workLocation,
  //       currentShift,
  //       typeOfRoute,
  //       scheduledForDate: typeOfRoute === "pickup" ? date_active : present_day,
  //     });
  //   }
  // );
});

exports.createRoute = catchAsync(async (req, res, next) => {
  const { cabEmployeeGroups, workLocation, currentShift, typeOfRoute } =
    req.body;

  if (!Array.isArray(cabEmployeeGroups) || cabEmployeeGroups.length === 0) {
    return next(new AppError(`Invalid or empty cabEmployeeGroups`, 400));
  }

  let baseDate = new Date(
    Date.UTC(
      new Date().getUTCFullYear(),
      new Date().getUTCMonth(),
      new Date().getUTCDate(),
      0,
      0,
      0,
      0
    )
  );
  const date_active = new Date(baseDate);
  date_active.setUTCDate(baseDate.getUTCDate() + 1);

  let existing_routes = await Route.find({
    typeOfRoute,
    workLocation,
    currentShift,
    activeOnDate: typeOfRoute === "pickup" ? date_active : baseDate,
  });

  if (existing_routes.length !== 0) {
    return next(
      new AppError(
        `A ${typeOfRoute} route already exists for shift ${currentShift} and workLocation: ${workLocation} on ${date_active.toISOString()}`
      )
    );
  }

  for (const group of cabEmployeeGroups) {
    const { cab, passengers, availableCapacity } = group;

    if (
      !cab ||
      !Array.isArray(passengers) ||
      typeof availableCapacity !== "number"
    ) {
      return next(new AppError(`Invalid data in cabEmployeeGroups`, 400));
    }

    const route_created = await Route.create({
      cab,
      passengers,
      workLocation,
      currentShift,
      typeOfRoute,
      availableCapacity,
      activeOnDate: typeOfRoute === "drop" ? baseDate : date_active,
    });
  }

  res.status(201).json({
    status: "Success",
    message: "Shifts confirmed and routes created successfully",
    scheduledForDate: typeOfRoute === "drop" ? baseDate : date_active,
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
      new Date().getUTCDate(),
      0,
      0,
      0,
      0
    )
  );
  const todayRoute = await Route.find({
    activeOnDate: {
      $eq: startDate,
    },
  })
    .populate({
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
    hasCabService: true,
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

  const present_day = new Date(
    Date.UTC(
      new Date().getUTCFullYear(),
      new Date().getUTCMonth(),
      new Date().getUTCDate()
    )
  );

  const todayRoutes = cab_all_routes.filter((route) => {
    const routeDate = new Date(
      Date.UTC(
        route.activeOnDate.getUTCFullYear(),
        route.activeOnDate.getUTCMonth(),
        route.activeOnDate.getUTCDate()
      )
    );
    return routeDate.getTime() === present_day.getTime();
  });

  if (todayRoutes.length === 0)
    return next(
      new AppError(`No routes assigned to this cab for today: ${cab_id}`, 404)
    );

  todayRoutes.forEach((route) => {
    if (route.typeOfRoute === "pickup" && route.routeStatus !== "completed") {
      pickArr.push(route);
    } else if (
      route.typeOfRoute === "drop" &&
      route.routeStatus !== "completed"
    ) {
      dropArr.push(route);
    }
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

exports.exportShiftsData = catchAsync(async (req, res, next) => {
  // let { cabEmployeeGroups, workLocation, currentShift, typeOfRoute } = req.body;
  // if (cabEmployeeGroups.length === 0 || !cabEmployeeGroups) {
  //   return next(new AppError(`Invalid or empty cabEmployeeGroups`, 400));
  // }

  const present_day = new Date(
    Date.UTC(
      new Date().getUTCFullYear(),
      new Date().getUTCMonth(),
      new Date().getUTCDate()
    )
  );
  const today_day_routes = await Route.find({
    activeOnDate: { $eq: present_day },
  })
    .populate("passengers")
    .populate({ path: "cab", populate: "cabDriver" });

  const shiftData = prepareShiftDataForExport(today_day_routes);

  const fileName = `roster_data_${present_day.toLocaleDateString()}.xlsx`;

  const buffer = exportShiftDataToExcel(shiftData, fileName);
  // set the content type and which will tell the browser to treat the response as a file to download
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.send(buffer);
  // res.status(200).json({
  //   status: "Success",
  //   data: shiftData,
  //   length: today_day_routes.length,
  // });
});
