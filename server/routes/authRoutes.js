const express = require("express");
const router = express.Router();
const { signUp, login, logout } = require("../controller/authController");

router.route("/signup").post(signUp);
router.route("/login").post(login);
router.route("/logout").get(logout);

module.exports = router;
