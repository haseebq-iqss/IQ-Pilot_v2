const cron = require("node-cron");
const Attendance = require("../models/attendance");
const { catchAsync } = require("../utils/catchAsync");

const updateAttendanceJob = catchAsync(async () => {
  // Find all attendance records where onLeave is true and numDays is greater than 0
  const attendancesToUpdate = await Attendance.find({
    "onLeave.type": true,
    "onLeave.numDays": { $gt: 0 },
  });

  await Promise.all(
    attendancesToUpdate.map(async (attendance) => {
      attendance.onLeave.numDays--;
      if (attendance.onLeave.numDays === 0) {
        attendance.onLeave.type = false;
        await attendance.updateOne({ isPresent: true }, { isPresent: false });
      }
      await attendance.save();
    })
  );

  console.log("Attendance records updated successfully.");
});

const run = () => {
  cron.schedule(" 59 23 * * *", () => updateAttendanceJob());
};

module.exports = { run };
