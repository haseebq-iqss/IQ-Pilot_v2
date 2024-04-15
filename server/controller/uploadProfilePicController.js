const multerConfig = require("../utils/multerProfilePicConfig");

const upload_profile_pic = multerConfig(
  `./public/images/profileImages`,
  "image/png",
  "image/jpeg"
).single("profilePicture");

module.exports = upload_profile_pic;
