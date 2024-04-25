const multer = require("multer");
const AppError = require("../utils/appError");
const User = require("../models/user");

const createMulterStorage = (destination) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      return cb(null, `${destination}`);
    },
    filename: async (req, file, cb) => {
      let fname, lname;
      if (!req.user) {
        fname = req.body.fname;
        lname = req.body.lname;
      } else {
        const user =
          req.user.role === "admin"
            ? await User.findById(req.params.id)
            : req.user;
        fname = user.fname;
        lname = user.lname;
      }
      const upload_name = `${fname[0].toLowerCase() + fname.slice(1)}_${lname[0].toLowerCase() + lname.slice(1)
        }_${Date.now()}`;
      return cb(null, `${upload_name}.${file.originalname.split(".")[1]}`);
    },
  });
};

const multerFilter = (filterBy) => {
  return function (req, file, cb) {
    const [type1, type2] = filterBy;
    if (file.mimetype === type1 || file.mimetype === type2) {
      cb(null, true);
    } else cb(new AppError(`Only JPEG and PNG files are allowed`, 400), false);
  };
};

const createUploadMiddleware = (destination, ...filterBy) => {
  const upload = multer({
    storage: createMulterStorage(destination),
    fileFilter: multerFilter(filterBy),
    limits: { fileSize: 1024 * 1024 },
  });
  return upload;
};

module.exports = createUploadMiddleware;
