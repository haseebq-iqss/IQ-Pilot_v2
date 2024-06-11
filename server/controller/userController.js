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
  console.log(driver);
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

// Cancel Cab
// const cancelCab = catchAsync(async (req, res, next) => {
//   const id = req.params.id;
// });
const cancelCab = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const user = await User.findById(id);
  if (!user)
    return next(
      new AppError(`User document with this id:${id} not found!`, 404)
    );
  user.isCabCancelled = !user.isCabCancelled;
  await user.save();

  res.status(200).json({ status: "Success", data: user });
});

module.exports = {
  getAllUsers,
  getAllTMS,
  getAllDrivers,
  getTM,
  getDriver,
  updateUser,
  deleteUser,
  cancelCab,
};
