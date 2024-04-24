const express = require("express");
const router = express.Router();
const {
  createShift,
  createRoute,
  getRoutes,
  getRoute,
} = require("../controller/routeController");
const { protect, restrictTo } = require("../controller/authController");

router.use(protect);
router.use(restrictTo("admin"));

router.route("/shifts").post(createShift);
router.route("/").post(createRoute).get(getRoutes);
router.route("/:id").get(getRoute);

module.exports = router;
