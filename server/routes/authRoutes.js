const express = require("express");
const router = express.Router();
const {
  signup,
  login,
  logout,
  autologin,
  protect,
  updatePassword,
  changePassword,
} = require("../controller/authController");
const upload_profile_pic = require("../controller/uploadProfilePicController");

router.post("/signup", upload_profile_pic, signup);
router.post("/login", login);
router.post("/autologin", autologin);
router.post("/logout", logout);

router.post("/update-password", protect, updatePassword);
router.put("/change-password", protect, changePassword);

module.exports = router;
