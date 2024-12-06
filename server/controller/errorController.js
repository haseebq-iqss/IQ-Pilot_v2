const AppError = require("../utils/appError");

function handleDBDuplicateError(error) {
  const name = Object.keys(error.keyValue);
  const message = `Duplicate field name ${name}. Please provide another value.`;
  return new AppError(message, 400);
}

function handleDBCastError(error) {
  const message = `Invalid ${error.path} :${error.value}`;
  return new AppError(message, 400);
}

function handleDBValidationError(error) {
  const errors = error.errors;
  const errorMessages = Object.values(errors);
  const message = errorMessages.map((err) => err.message).join(" ");
  return new AppError(message, 400);
}

function handleJWTError() {
  return new AppError(`Invalid JWT token...Please log in again`, 401);
}

function handleJWTExpiredError() {
  return new AppError(`Your token has Expired! Please log in again`, 401);
}

function sendDevError(err, res) {
  return res.status(err.statusCode).json({
    message: err.message,
    error: err,
    stack: err.stack,
  });
}

function sendProdError(err, res) {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.errmsg || err.message,
    });
  } else {
    console.error("Error ***: ", err);
    return res.status(500).json({
      status: "ERROR",
      message: "Something went wrong...",
    });
  }
}

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendDevError(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    error.name = err.name;
    error.errmsg = err.message;

    if (error.name === "CastError") {
      error = handleDBCastError(err);
    }
    if (error.code === 11000) {
      error = handleDBDuplicateError(err);
    }
    if (error.name === "ValidationError") {
      error = handleDBValidationError(err);
    }
    if (error.name === "JsonWebTokenError") error = handleJWTError();
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError();

    sendProdError(error, res);
  }
};
