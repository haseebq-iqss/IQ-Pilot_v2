const fs = require("node:fs");
const Cab = require("../models/cab");
const Route = require("../models/route");
const User = require("../models/user");
const AppError = require("../utils/appError");
const { catchAsync } = require("../utils/catchAsync");

const filterReqObj = (reqObj) => {
  const newObj = {};
  Object.keys(reqObj).forEach((key) => {
    if (key !== "role") newObj[key] = reqObj[key];
  });
  return newObj;
};

const getAllUsers = catchAsync(async (req, res, next) => {
  const all_users = await User.find({});
  if (all_users.length === 0) {
    return next(new AppError(`No users found...`), 404);
  }
  res
    .status(200)
    .json({ status: "Success", results: all_users.length, data: all_users });
});

const getAllTMS = catchAsync(async (req, res, next) => {
  const all_tms = await User.find({ role: "employee" }).sort({ fname: 1 });
  if (all_tms.length === 0) {
    return next(new AppError(`No team members found...`), 404);
  }
  res
    .status(200)
    .json({ status: "Success", results: all_tms.length, data: all_tms });
});

const getAllDrivers = catchAsync(async (req, res, next) => {
  const all_drivers = await User.find({ role: "driver" }).sort({ fname: 1 });
  if (all_drivers.length === 0) {
    return next(new AppError(`No team members found...`), 404);
  }
  res.status(200).json({
    status: "Success",
    results: all_drivers.length,
    data: all_drivers,
  });
});

// GET a Employee and a Driver
const getTM = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const employee = await User.findById(id);
  if (!employee) {
    return next(new AppError(`No document found with this id`, 404));
  }
  res.status(200).json({ status: "Success", data: employee });
});
const getDriver = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const driver = await User.findById(id);
  if (!driver) {
    return next(new AppError(`No document found with this id`, 404));
  }
  res.status(200).json({ status: "Success", data: driver });
});

// Update tm and driver details
// Employee and Admin Actions
const updateUser = catchAsync(async (req, res, next) => {
  if (req.body.password) {
    return next(new AppError(`This route is not for password updates.`, 404));
  }
  const filteredReqObj = filterReqObj(req.body);
  const updated_user = await User.findByIdAndUpdate(
    req.params.id,
    {
      ...filteredReqObj,
      profilePicture:
        req.file?.filename ||
        (await User.findById(req.params.id).profilePicture),
    },
    {
      new: true,
      runValidators: true,
    }
  );
  if (!updated_user) {
    return next(new AppError(`No document found with this id`, 404));
  }
  res.status(200).json({ status: "Success", data: updated_user });
});

const getEmployeeCab = catchAsync(async (req, res, next) => {
  let found_route;
  const emp_id = req.params.id;
  const employee = await User.findById(emp_id);
  if (!employee)
    return next(new AppError(`No employee with this id:${emp_id}`, 404));

  const currentDay = new Date();
  currentDay.setHours(0, 0, 0, 0);

  const routes = await Route.find({
    workLocation: employee.workLocation,
    currentShift: employee.currentShift,
  });
  const curr_day_routes = routes.filter((route) => {
    const routeCreatedAt = new Date(route.createdAt);
    routeCreatedAt.setHours(0, 0, 0, 0);
    return (
      routeCreatedAt.getTime() === currentDay.getTime() &&
      route.routeStatus !== "completed"
    );
  });
  for (const route of curr_day_routes) {
    const flag = route.passengers.some(
      (passenger) => passenger.toString() === emp_id.toString()
    );
    if (flag) {
      // cab = await Cab.findById(route.cab).populate("cabDriver");
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

const getTMSAssignedCabs = catchAsync(async (req, res, next) => {
  const currentDay = new Date();
  currentDay.setHours(0, 0, 0, 0);

  const routes = await Route.aggregate([
    {
      $lookup: {
        from: "cabs",
        localField: "cab",
        foreignField: "_id",
        as: "cabDetails",
      },
    },
  ]);

  const curr_day_routes = routes.filter((route) => {
    const routeCreatedAt = new Date(route.createdAt);
    routeCreatedAt.setHours(0, 0, 0, 0);
    return routeCreatedAt.getTime() === currentDay.getTime();
  });

  let passenger_cab_details = [];
  for (const route of curr_day_routes) {
    const [cab_details] = route.cabDetails;
    const cab_number = cab_details.cabNumber;
    route.passengers.forEach((passenger) => {
      passenger_cab_details.push({ id: passenger, cab_number });
    });
  }
  res.status(200).json({ status: "Message", data: passenger_cab_details });
});

// Admin Action only
const deleteUser = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const deleted_user = await User.findByIdAndDelete(id);
  if (!deleted_user) {
    return next(new AppError(`No document found with this id`, 404));
  }

  if (
    deleted_user.profilePicture &&
    deleted_user.profilePicture !== "dummy.jpg"
  ) {
    fs.unlinkSync(
      `./public/images/profileImages/${deleted_user?.profilePicture}`
    );
  }

  if (deleted_user.role === "driver") {
    await Cab.findOneAndDelete({ cabDriver: deleted_user._id });
  }

  res.status(204).json({ status: "Success", message: "User deleted!" });
});

module.exports = {
  getAllUsers,
  getAllTMS,
  getAllDrivers,
  getTM,
  getDriver,
  updateUser,
  deleteUser,
  getEmployeeCab,
  getTMSAssignedCabs,
};
