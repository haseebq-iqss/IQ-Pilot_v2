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
  updateRoute,
  deleteRoute,
  getActiveRoutes,
  totalDistanceMonth,
} = require("../controller/routeController");
const { protect, restrictTo } = require("../controller/authController");

router.use(protect);
// router.use(restrictTo("admin"));

router.route("/shifts").post(createShift);
router.route("/totalDistanceMonth").get(totalDistanceMonth);

router.route("/pendingPassengers").get(restrictTo("admin"), pendingPassengers);
router
  .route("/rosteredPassengers")
  .get(restrictTo("admin"), rosteredPassengers);
router
  .route("/driverRoute/:id")
  .get(restrictTo("admin", "driver"), driverRoute);

router.route("/").post(restrictTo("admin"), createRoute).get(getRoutes);
router.route("/activeRoutes").get(restrictTo("admin"), getActiveRoutes);
router
  .route("/:id")
  .get(restrictTo("admin", "driver"), getRoute)
  .patch(restrictTo("admin", "driver"), updateRoute)
  .delete(restrictTo("admin", "driver"), deleteRoute);

module.exports = router;
