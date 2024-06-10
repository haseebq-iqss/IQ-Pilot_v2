const attendanceController = require("../controller/attendanceController");
const express = require("express");
const { protect, restrictTo } = require("../controller/authController");
const { updateLeaveStatus } = require("../utils/cronJob");
const { catchAsync } = require("../utils/catchAsync");

const router = express.Router();

router.use(protect);
router.use(restrictTo("admin", "driver"));

router.post("/", attendanceController.createAttendance);
router.get("/", attendanceController.getAllAttendances);
router.get("/shrinkageMonth", attendanceController.getMonthShrinkage);

router
  .route("/:id")
  .get(attendanceController.getAttendanceById)
  .put(attendanceController.updateAttendance)
  .delete(attendanceController.deleteAttendance);

router.get("/route-attendance/:id", attendanceController.getAttendanceByRoute);

module.exports = router;
