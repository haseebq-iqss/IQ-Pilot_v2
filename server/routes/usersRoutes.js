const express = require("express");
const upload_profile_pic = require("../controller/uploadProfilePicController");

const {
  getAllUsers,
  getAllTMS,
  getAllDrivers,
  getTM,
  getDriver,
  updateUser,
  deleteUser,
  getEmployeeCab,
} = require("../controller/userController");
const { protect, restrictTo } = require("../controller/authController");

const router = express.Router();

router.use(protect);

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
  .route("/tm/cab/:id")
  .get(restrictTo("admin", "employee"), getEmployeeCab);

module.exports = router;
