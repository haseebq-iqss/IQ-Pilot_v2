const Employee = require("../models/employee");
const AppError = require("../utils/appError");
const { catchAsync } = require("../utils/catchAsync");

const filter_req_obj = function (reqBody) {
  const newReqObj = {};
  Object.keys(reqBody).forEach((key) => {
    if (key !== "role") {
      newReqObj[key] = reqBody[key];
    }
  });
  return newReqObj;
};
//get all employees
const getAllEmployees = catchAsync(async function (req, res, next) {
  const allUsers = await Employee.find();
  if (allUsers.length === 0) {
    return next(new AppError("No Users Found", 404));
  }
  res
    .status(200)
    .json({ status: "Success", data: allUsers, results: allUsers.length });
});

// get all team members
const getAllTeamMembers = catchAsync(async function (req, res, next) {
  const tms = await Employee.find({ role: "employee" });
  if (tms.length === 0) {
    return next(new AppError("No Team Members Found", 404));
  }
  res.status(200).json({ status: "Success", data: tms, results: tms.length });
});

// get all drivers
const getAllDrivers = catchAsync(async function (req, res, next) {
  const drivers = await Employee.find({ role: "driver" });
  if (drivers.length === 0) {
    return next(new AppError("No Driver Found", 404));
  }
  res
    .status(200)
    .json({ status: "Success", data: drivers, results: drivers.length });
});

// get tm
const getTm = catchAsync(async function (req, res, next) {
  const tm = await Employee.findById(req.params.id);
  if (!tm) {
    return next(new AppError("No Team Member Found ", 404));
  }
  res.status(200).json({ status: "Success", data: tm });
});

// get driver
const getDriver = catchAsync(async function (req, res, next) {
  const driver = await Employee.findById(req.params.id);
  if (!driver) {
    return next(new AppError("No Driver Found ", 404));
  }
  res.status(200).json({ status: "Success", data: driver });
});

// update User
const updateUser = catchAsync(async function (req, res, next) {
  if (req.body.password) {
    return next(new AppError("This route is not for password updates", 401));
  }
  const filteredReqObj = filter_req_obj(req.body);
  const user = await Employee.findByIdAndUpdate(req.params.id, filteredReqObj, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    return next(new AppError("No User Found", 404));
  }
  res.status(200).json({ status: "Success", data: user });
});

// delete user
const deleteUser = catchAsync(async function (req, res, next) {
  await Employee.findByIdAndDelete(req.params.id);
  res.status(204).json({ status: "Success" });
});

module.exports = {
  getAllEmployees,
  getAllTeamMembers,
  getAllDrivers,
  getTm,
  getDriver,
  updateUser,
  deleteUser,
};
