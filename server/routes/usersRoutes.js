// const express = require("express");
// const router = express.Router();

// const { protect, restrictTo } = require("../controller/authController");
// const {
//   getAllEmployees,
//   getAllTeamMembers,
//   getAllDrivers,
//   getTm,
//   getDriver,
//   updateUser,
//   deleteUser,
// } = require("../controller/employeeController");

// router.use(protect);

// router.get("/", restrictTo("admin"), getAllEmployees);
// router.get("/tms", restrictTo("admin"), getAllTeamMembers);
// router.get("/drivers", restrictTo("admin"), getAllDrivers);

// router
//   .route("/tm/:id")
//   .get(restrictTo("admin", "employee"), getTm)
//   .patch(restrictTo("admin", "employee"), updateUser)
//   .delete(restrictTo("admin"), deleteUser);

// router
//   .route("/driver/:id")
//   .get(restrictTo("admin", "driver"), getDriver)
//   .patch(restrictTo("admin", "driver"), updateUser)
//   .delete(restrictTo("admin"), deleteUser);

// module.exports = router;
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

module.exports = router;
