function sendDevError(err, res) {
  return res.statusCode(err.statusCode).json({
    message: err.message,
    error: err,
    stack: err.stack,
  });
}
function handleDBDuplicateError(error) {}

function handleDBCastError(error) {}

function handleDBValidationError(error) {}

function sendProdError(err, res) {}

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
