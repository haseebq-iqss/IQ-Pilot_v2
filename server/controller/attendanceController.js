const Attendance = require("../models/attendance");
const AppError = require("../utils/appError");
const { catchAsync } = require("../utils/catchAsync");

exports.createAttendance = catchAsync(async function (req, res, next) {
  const { ofEmployee, ofRoute, isPresent, onLeave } = req.body;
  const attendance = await Attendance.create({
    ofEmployee,
    ofRoute,
    isPresent,
    onLeave,
  });
  res.status(200).json({ message: "Success", attendance });
});

exports.getAllAttendances = catchAsync(async function (req, res, next) {
  const allAttendances = await Attendance.find({});
  if (!allAttendances || allAttendances.length === 0) {
    return next(new AppError("No attendance found", 404));
  }
  res.status(200).json({ message: "Success", allAttendances });
});

exports.getAttendanceById = catchAsync(async function (req, res, next) {
  const attendanceById = await Attendance.findById(req.params.id);
  if (!attendanceById) {
    return next(new AppError("No attendance found with this ID", 404));
  }
  res.status(200).json({ message: "Success", attendanceById });
});

exports.updateAttendance = catchAsync(async function (req, res, next) {
  const { isPresent, onLeave } = req.body;
  const updateData = {};
  if (isPresent !== undefined) {
    updateData.isPresent = isPresent;
  }
  if (onLeave !== undefined) {
    updateData.onLeave = onLeave;
  }
  const update = await Attendance.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });
  if (!update) {
    return next(new AppError("No attendance found with this ID", 404));
  }
  res.status(200).json({ message: "Success", update });
});

exports.deleteAttendance = catchAsync(async function (req, res, next) {
  const remove = await Attendance.findByIdAndDelete(req.params.id);
  if (!remove) {
    return next(new AppError("No attendance found with this ID", 404));
  }
  res.status(200).json({ message: "Success", remove });
});
