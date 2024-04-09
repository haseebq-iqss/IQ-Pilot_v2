const express = require("express");
const router = express.Router();
const { signup, login, logout } = require("../controller/authController");
const upload_profile_pic = require("../controller/uploadProfilePicController");

router.post("/signup", upload_profile_pic, signup);
router.post("/login", login);
router.post("/logout", logout);

module.exports = router;
