const express = require("express");
const { protect, restrictTo } = require("../controller/authController");
const {
  getAllCabs,
  createCab,
  getCabByDriver,
  updateCab,
  deleteCab,
} = require("../controller/cabController");

const router = express.Router();

router.use(protect);
router.use(restrictTo("admin"));

router.route("/").get(getAllCabs).post(createCab);
router.route("/:id").get(getCabByDriver).patch(updateCab).delete(deleteCab);

module.exports = router;
