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

exports.getAttendanceByRoute = catchAsync(async (req, res, next) => {
  const route_id = req.params.id;
  const route_attendance = await Attendance.find({
    ofRoute: route_id,
  }).populate("ofEmployee");
  res.status(200).json({ status: "Success", route_attendance });
});

exports.getMonthShrinkage = catchAsync(async (req, res, next) => {
  const now = new Date();
  const firstDayMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstDayNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const attendances = await Attendance.find({
    createdAt: {
      $gte: firstDayMonth,
      $lte: firstDayNextMonth,
    },
  });

  const no_absentees_for_month = attendances.reduce(
    (acc, attendance) => (attendance.isPresent ? acc : acc + 1),
    0
  );

  const shrinkage_percentage = attendances.length
    ? Number(((no_absentees_for_month / attendances.length) * 100).toFixed(1))
    : 0;

  res.status(200).json({ status: "Success", data: shrinkage_percentage });
});
