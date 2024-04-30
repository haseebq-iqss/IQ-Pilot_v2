const cron = require("node-cron");
const Attendance = require("../models/attendance");
const { catchAsync } = require("./catchAsync");

const updateAttendanceJob = catchAsync(async () => {
  const result = await Attendance.updateMany(
    { isPresent: false },
    { isPresent: true }
  );
  console.log(`${result.nModified} attendance records updated.`);
});

const run = () => {
  cron.schedule("59 23 * * *", updateAttendanceJob);
};

module.exports = { run };
