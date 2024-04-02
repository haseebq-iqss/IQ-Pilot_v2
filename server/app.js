const globalErrorController = require("./controller/errorController");
const express = require("express");
const AppError = require("./utils/appError");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoutes");
const app = express();

app.use(cors(["http://localhost:5173/", "http://localhost:5174/"]));
app.use(cookieParser());
app.use(express.json());

app.use("/api/v2/auth", authRoutes);
app.all("*", (req, res, next) => {
  const error = new AppError(`This page ${req.url} does not exist`, 404);
  next(error);
});

app.use(globalErrorController);
module.exports = app;
