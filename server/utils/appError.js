class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${this.statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOptional = true;
    Error.captureStackTrace(constructor, this.constructor);
  }
}
module.exports = AppError;
