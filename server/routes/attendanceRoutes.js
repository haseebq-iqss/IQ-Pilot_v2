const attendanceController = require("../controller/attendanceController");
const express = require("express");
const { protect, restrictTo } = require("../controller/authController");
const { updateLeaveStatus } = require("../utils/cronJob");
const { catchAsync } = require("../utils/catchAsync");

const router = express.Router();
router.post(
  "/",
  protect,
  restrictTo("admin"),
  attendanceController.createAttendance
);

router.get(
  "/",
  protect,
  restrictTo("admin"),
  attendanceController.getAllAttendances
);

router
  .route("/:id")
  .get(protect, restrictTo("admin"), attendanceController.getAttendanceById)
  .put(protect, restrictTo("admin"), attendanceController.updateAttendance)
  .delete(protect, restrictTo("admin"), attendanceController.deleteAttendance);

module.exports = router;
