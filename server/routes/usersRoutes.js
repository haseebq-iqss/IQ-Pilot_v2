const express = require("express");
const upload_profile_pic = require("../controller/uploadProfilePicController");
const upload_emps_leave_status = require("../controller/uploadEmpLeaveController");

const {
  getAllUsers,
  getAllTMS,
  getAllDrivers,
  getTM,
  getDriver,
  updateUser,
  deleteUser,
  cancelCab,
  bulkUserUpload,
  uploadEmplLeaveSheets,
} = require("../controller/userController");
const { protect, restrictTo } = require("../controller/authController");

const router = express.Router();

router.use(protect);

router.post(
  "/upload-emp-leave-excel",
  restrictTo("admin"),
  upload_emps_leave_status,
  uploadEmplLeaveSheets
);

router.get("/", restrictTo("admin"), getAllUsers);
router.get("/tms", restrictTo("admin"), getAllTMS);
router.get("/drivers", restrictTo("admin"), getAllDrivers);

router
  .route("/tm/:id")
  .get(restrictTo("admin", "employee"), getTM)
  .patch(restrictTo("admin", "employee"), upload_profile_pic, updateUser)
  .delete(restrictTo("admin"), deleteUser);

router
  .route("/driver/:id")
  .get(restrictTo("admin", "driver"), getDriver)
  .patch(restrictTo("admin", "driver"), upload_profile_pic, updateUser)
  .delete(restrictTo("admin"), deleteUser);

router
  .route("/cancel-cab/:id")
  .patch(restrictTo("admin", "employee"), cancelCab);


router.route("/bulk-upload").post(restrictTo("admin"), bulkUserUpload);

module.exports = router;
