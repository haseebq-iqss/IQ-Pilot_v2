const sharp = require("sharp");
const fs = require("fs");

const imageProcess = async (fName, lName, base64Image, path) => {
  const buffer = Buffer.from(base64Image, "base64");
  const resizeImage = await sharp(buffer)
    .resize({ fit: "inside", width: 800, height: 800 })
    .png({ quality: 90 })
    .toBuffer();
  const png_format = `/${path}/${`${fName}_${lName}` + Date.now() + ".png"}`;
  fs.writeFileSync(`./public/images/${png_format}`, resizeImage);
  return png_format;
};
module.exports = imageProcess;
