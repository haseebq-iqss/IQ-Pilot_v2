const globalErrorController = require("./controller/errorController");
const express = require("express");
const AppError = require("./utils/appError");
const app = express();

app.all("*", (req, res, next) => {
  const error = new AppError(`This page ${req.url} does not exist`, 404);
  next(error);
});

app.use(globalErrorController);
module.exports = app;
