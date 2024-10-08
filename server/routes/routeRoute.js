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
  driverRoutesForMonth,
  createShiftKM,
  getTodayRoute,
  exportShiftsData,
} = require("../controller/routeController");
const { protect, restrictTo } = require("../controller/authController");

router.use(protect);

router.route("/").post(restrictTo("admin"), createRoute).get(getRoutes);
// router.route("/shifts").post(createShift);
router.route("/createShiftK-Means").post(createShiftKM);

router.route("/totalDistanceMonth").get(totalDistanceMonth);

router.get("/todayRoute", getTodayRoute);
router.route("/activeRoutes").get(restrictTo("admin"), getActiveRoutes);
router.route("/pendingPassengers").get(restrictTo("admin"), pendingPassengers);
router
  .route("/rosteredPassengers")
  .get(restrictTo("admin"), rosteredPassengers);

router
  .route("/:id")
  .get(restrictTo("admin", "driver"), getRoute)
  .patch(restrictTo("admin", "driver"), updateRoute)
  .delete(restrictTo("admin", "driver"), deleteRoute);

router
  .route("/driverRoute/:id")
  .get(restrictTo("admin", "driver"), driverRoute);
router
  .route("/driverRoutesMonth/:id")
  .get(restrictTo("admin", "driver"), driverRoutesForMonth);

router.get("/exports/shifts-data", restrictTo("admin"), exportShiftsData);

module.exports = router;
