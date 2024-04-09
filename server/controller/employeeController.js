const Employee = require("../models/employee");
const AppError = require("../utils/appError");
const { catchAsync } = require("../utils/catchAsync");

const filterReqObj = (reqObj) => {
  const newObj = {};
  Object.keys(reqObj).forEach((key) => {
    if (key !== "role") newObj[key] = reqObj[key];
  });
  console.log(newObj);
  return newObj;
};

const getAllUsers = catchAsync(async (req, res, next) => {
  const all_users = await Employee.find({});
  if (all_users.length === 0) {
    return next(new AppError(`No users found...`), 404);
  }
  res
    .status(200)
    .json({ status: "Success", results: all_users.length, data: all_users });
});

const getAllTMS = catchAsync(async (req, res, next) => {
  const all_tms = await Employee.find({ role: "employee" });
  if (all_tms.length === 0) {
    return next(new AppError(`No team members found...`), 404);
  }
  res
    .status(200)
    .json({ status: "Success", results: all_tms.length, data: all_tms });
});

const getAllDrivers = catchAsync(async (req, res, next) => {
  const all_drivers = await Employee.find({ role: "driver" });
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
  const employee = await Employee.findById(id);
  if (!employee) {
    return next(new AppError(`No document found with this id`, 404));
  }
  res.status(200).json({ status: "Success", data: employee });
});
const getDriver = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const driver = await Employee.findById(id);
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
  const updated_user = await Employee.findByIdAndUpdate(
    req.params.id,
    {
      ...filteredReqObj,
      profilePicture: req.file?.filename || updated_user.profilePicture,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  if (updated_user) {
    return next(new AppError(`No document found with this id`, 404));
  }
  res.status(200).json({ status: "Success", data: updated_user });
});

// Admin Action only
const deleteUser = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const deleted_user = await Employee.findByIdAndDelete(id);
  if (!deleteUser) {
    return next(new AppError(`No document found with this id`, 404));
  }
  res.status(204).json({ status: "Success" });
});

module.exports = {
  getAllUsers,
  getAllTMS,
  getAllDrivers,
  getTM,
  getDriver,
  updateUser,
  deleteUser,
};
