const express = require("express");
const { protect, restrictTo } = require("../controller/authController");
const {
  getAllCabs,
  createCab,
  getCabByDriver,
  updateCab,
  deleteCab,
  getEmployeeCab,
  getTMSAssignedCabs,
  availableCabs,
  getCabByID,
} = require("../controller/cabController");

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(restrictTo("admin"), getAllCabs)
  .post(restrictTo("admin"), createCab);
router.route("/availableCabs").get(restrictTo("admin"), availableCabs);
router
  .route("/:id")
  .get(restrictTo("admin", "driver"), getCabByID)
  .patch(restrictTo("admin"), updateCab)
  .delete(restrictTo("admin"), deleteCab);

router.route("/driver/:id").get(restrictTo("admin"), getCabByDriver)
router
  .route("/tm/cab/:id")
  .get(restrictTo("admin", "employee"), getEmployeeCab);

router.route("/tms/assignedCabs").get(getTMSAssignedCabs);
module.exports = router;
