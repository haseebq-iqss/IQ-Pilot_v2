const express = require("express");
const router = express.Router();
const { signUp, login } = require("../controller/authController");

router.route("/signup").post(signUp);
router.route("/login").post(login);

module.exports = router;
