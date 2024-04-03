const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const AppError = require("./utils/appError");
const globalErrorController = require("./controller/errorController");
const app = express();

// Middlewares
app.use(cors({
  credentials : true,
  origin : ["http://localhost:5173", "http://localhost:5174"]
}));
app.use(cookieParser());
app.use(express.json());

// ROUTES
app.use("/api/v2/auth", authRoutes);

app.all("*", (req, res, next) => {
  const error = new AppError(`This page ${req.url} does not exist`, 404);
  next(error);
});

app.use(globalErrorController);
module.exports = app;
