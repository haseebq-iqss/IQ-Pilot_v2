const express = require("express");
const router = express.Router();
const routeController = require("../controller/routeController");
const { protect } = require("../controller/authController");

router.post("/create", protect, routeController.createRoute);

module.exports = router;
