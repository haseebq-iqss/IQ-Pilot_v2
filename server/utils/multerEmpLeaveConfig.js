const multer = require("multer");
const path = require("node:path");
const fs = require("node:fs");

function createMulterStorage(destination) {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const upload_path = path.resolve(__dirname, "../", destination);

      if (!fs.existsSync(upload_path)) {
        fs.mkdirSync(upload_path, { recursive: true });
      }

      cb(null, upload_path);
    },
    filename: (req, file, cb) => {
      const now = new Date();
      const current_date = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
      );
      const upload_name = `${file.originalname}`;
      console.log(upload_name);
      cb(null, upload_name);
    },
  });
}

const createUploadMiddleware = (destination) => {
  const upload = multer({ storage: createMulterStorage(destination) });
  return upload;
};

module.exports = createUploadMiddleware;
