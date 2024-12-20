const { catchAsync } = require("../utils/catchAsync");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const AppError = require("../utils/appError");
const Cab = require("../models/cab");

const signingFunction = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

const createSendToken = function (user, statusCode, res) {
  const jwt_token = signingFunction(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: false,
  };
  if (process.env.NODE_ENV === "production") {
    cookieOptions.secure = true;
    cookieOptions.sameSite = "none";
  }

  res.cookie("jwt", jwt_token, cookieOptions);
  user.password = undefined;
  res.status(statusCode).json({ status: "Success", jwt_token, user });
};

const signup = catchAsync(async (req, res, next) => {
  const user = await User.create({
    ...req.body,
    profilePicture: req.file?.filename || "dummy.jpg",
  });
  if (user.role === "driver") {
    await Cab.create({
      cabDriver: user._id,
      cabNumber: req.body.cabNumber,
      seatingCapacity: req.body.seatingCapacity,
      numberPlate: req.body.numberPlate,
      carModel: req.body.carModel,
      carColor: req.body.carColor,
      mileage: req.body.mileage,
      acInstalled: req.body.acInstalled,
      typeOfCab: req.body.typeOfCab,
      androidSetup: req.body.androidSetup,
    });
  }
  // createSendToken(user, 201, res);
  res
    .status(201)
    .json({ status: "Success", message: "Created Successfully", user });
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.checkPassword(password))) {
    return next(new AppError("Incorrect email or password", 401));
  }
  createSendToken(user, 200, res);
});

// Authentication
const protect = catchAsync(async (req, res, next) => {
  let token;
  token = req.cookies.jwt;
  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access", 400)
    );
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  if (!decoded) {
    return next(new AppError("Invalid token! Please login again", 401));
  }
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(" The user belonging to this token does not exist", 400)
    );
  }
  req.user = currentUser;
  next();
});

//Authorization
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("User is not authorized to perform this action", 403)
      );
    }
    next();
  };
};

// LOGOUT
const logout = (req, res, next) => {
  let token = req.cookies.jwt;
  if (token) {
    // res.cookie("jwt", "");
    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "none",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({ status: "Success", message: "User logged out" });
  } else return next(new AppError(`No JWT cookie found`, 400));
};

// AutoLogin
const autologin = catchAsync(async (req, res, next) => {
  let token = req.cookies.jwt;
  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access", 400)
    );
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const currentUser = await User.findById(decoded.id);
  if (!currentUser)
    return next(
      new AppError(" The user belonging to this token does not exist", 400)
    );
  res.status(200).json({
    status: "Success",
    message: "User is already logged In",
    data: currentUser,
  });
});

// update password
const updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("+password");
  if (!user) return new AppError(`No User found...`, 404);

  user.password = req.body.password;
  await user.save();
  createSendToken(user, 200, res);
});

// Change Password with old password
const changePassword = catchAsync(async (req, res, next) => {
  const newPassword = req.body.newPassword;
  const oldPassword = req.body.oldPassword;
  const userId = req.user._id;

  const user = await User.findById(userId).select("+password");

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const isMatch = await user.checkPassword(oldPassword);
  if (!isMatch) {
    return next(new AppError("Incorrect old password", 400));
  }

  user.password = newPassword;

  await user
    .save()
    .then(() =>
      res.status(200).json({ message: "Password updated successfully" })
    )
    .catch((err) => next(new AppError(err.message, 400)));
});

module.exports = {
  signup,
  login,
  protect,
  restrictTo,
  logout,
  autologin,
  updatePassword,
  changePassword,
};
