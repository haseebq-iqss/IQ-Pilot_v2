const AppError = require("../utils/appError");
const Employee = require("../models/employee");

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.employee.role)) {
      return next(new AppError("", 403));
    }
    next();
  };
};

module.exports = restrictTo;
