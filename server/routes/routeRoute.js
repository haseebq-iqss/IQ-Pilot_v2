const express = require("express");
const router = express.Router();
const {
  createShift,
  createRoute,
  getRoutes,
  getRoute,
  pendingPassengers,
  rosteredPassengers,
  driverRoute,
  availableCabs,
} = require("../controller/routeController");
const { protect, restrictTo } = require("../controller/authController");

router.use(protect);
router.use(restrictTo("admin"));

router.route("/shifts").post(createShift);

router.route("/pendingPassengers").get(pendingPassengers);
router.route("/rosteredPassengers").get(rosteredPassengers);
router.route("/driverRoute/:id").get(driverRoute);
router.route("/availableCabs").get(availableCabs);

router.route("/").post(createRoute).get(getRoutes);
router.route("/:id").get(getRoute);

module.exports = router;
