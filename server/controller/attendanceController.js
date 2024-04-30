const Attendance = require("../models/attendance");
const AppError = require("../utils/appError");
const { catchAsync } = require("../utils/catchAsync");
exports.createAttendance = catchAsync(async function (req, res, next) {
  const { ofEmployee, ofRoute, isPresent } = req.body;
  const attendance = await Attendance.create({
    ofEmployee,
    ofRoute,
    isPresent,
  });
  res.status(200).json({ message: "Success", attendance });
});

exports.getAllAttendances = catchAsync(async function (req, res, next) {
  const allAttendances = await Attendance.find({});
  if (!allAttendances) {
    return next(new AppError("no attendance found at this id", 404));
  }
  res.status(200).json({ message: "Success", allAttendances });
});

exports.getAttendanceById = catchAsync(async function (req, res, next) {
  const attendanceById = await Attendance.findById(req.params.id);
  if (!attendanceById) {
    return next(new AppError("no attendance found at this id", 404));
  }
  res.status(200).json({ message: "Success", attendanceById });
});

exports.updateAttendance = catchAsync(async function (req, res, next) {
  const { isPresent } = req.body;
  const update = await Attendance.findByIdAndUpdate(
    req.params.id,
    { isPresent },
    { new: true, runValidators: true }
  );
  if (!update) {
    return next(new AppError("no attendance found at this id", 404));
  }
  res.status(200).json({ message: "Success", update });
});

exports.deleteAttendance = catchAsync(async function (req, res, next) {
  const remove = await Attendance.findByIdAndDelete(req.params.id);
  if (!remove) {
    return next(new AppError("no attendance found at this id", 404));
  }
  res.status(200).json({ message: "Success", remove });
});
