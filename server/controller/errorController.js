function sendDevError(err, res) {
  return res.status(err.statusCode).json({
    message: err.message,
    error: err,
    stack: err.stack,
  });
}
function handleDBDuplicateError(error) {
  const { name } = error.keyValue;
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
  return new AppError(`ERROR: ${message}`, 400);
}

function sendProdError(err, res) {
  if (err.isOperational)
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  else {
    return res.status(500).json({
      status: "ERROR",
      message: "Something went wrong...",
    });
  }
}

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "fail";
  if (process.env.NODE_ENV === "development") {
    sendDevError(err, res);
  } else if (process.env.NODE_ENV === "production") {
    const error = Object.assign({}, err);
    if (error.name === "CastError") {
      error = handleDBCastError(err);
    } else if (error.code === 11000) {
      error = handleDBDuplicateError(err);
    } else if (error.code === "ValidationError") {
      error = handleDBValidationError(err);
    }
    sendProdError(error, res);
  }
};
