const express = require("express");
const router = express.Router();

const { protect, restrictTo } = require("../controller/authController");
const {
  createCab,
  getCabDetails,
  getCab,
  updateCab,
  deleteCab,
} = require("../controller/cabController");

router.use(protect);

router.post("/", restrictTo("admin"), createCab);
router.get("/details", restrictTo("admin"), getCabDetails);

router
  .route("cab/:id")
  .get(restrictTo("admin"), getCab)
  .patch(restrictTo("admin"), updateCab)
  .delete(restrictTo("admin"), deleteCab);

module.exports = router;
