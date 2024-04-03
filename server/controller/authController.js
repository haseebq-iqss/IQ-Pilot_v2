const { catchAsync } = require("../utils/catchAsync");
const Employee = require("../models/employee");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const AppError = require("../utils/appError");

const signingFunction = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

const createSendToken = function (user, statusCode, res) {
  const jwt_token = signingFunction(user._id);
  const cookieOptions = {
    httpOnly: true,
    expiresIn: Date.now() + process.env.JWT_EXPIRES * 24 * 60 * 60 * 1000,
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", jwt_token, cookieOptions);
  user.password = undefined;
  res.status(statusCode).json({ status: "Success", jwt_token, user });
};

const signUp = catchAsync(async (req, res, next) => {
  const employee = await Employee.create(req.body);
  createSendToken(employee, 201, res);
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }
  const employee = await Employee.findOne({ email }).select("+password");
  if (!employee || !(await employee.checkPassword(password))) {
    return next(new AppError("Incorrect email or password", 401));
  }
  createSendToken(employee, 200, res);
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
  const currentUser = await Employee.findById(decoded.id);
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
    if (!roles.includes(req.employee.role)) {
      return next(
        new AppError("User is not authorized to perform this action", 403)
      );
    }
    next();
  };
};

module.exports = {
  signUp,
  login,
  protect,
  restrictTo,
};
