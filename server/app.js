const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const cabRoutes = require("./routes/cabRoutes");
const authRoutes = require("./routes/authRoutes");
const AppError = require("./utils/appError");
const globalErrorController = require("./controller/errorController");
const usersRoutes = require("./routes/usersRoutes");
const routeRouter = require("./routes/routeRoute");
// const cronJob = require("./utils/cronJob");
const attendanceRouter = require("./routes/attendanceRoutes");
const app = express();

// Middlewares
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "https://ipvt.vercel.app");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(
  cors({
    credentials: true,
    exposedHeaders: "Set-Cookie",
    origin: ["http://localhost:5173", "https://6zkcx3p4-5173.inc1.devtunnels.ms", "https://ipvt.vercel.app", "http://127.0.0.1:5500/", "http://iqpilot.s3-website.ap-south-1.amazonaws.com/", "https://d1yv0plhtxvzs7.cloudfront.net/"],
  })
);

app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// UPLOADS
app.use(express.static(`${__dirname}/public/images/profileImages/`));

// ROUTES
app.use("/api/v2/auth", authRoutes);
app.use("/api/v2/users", usersRoutes);
app.use("/api/v2/cabs", cabRoutes);
app.use("/api/v2/routes", routeRouter);
app.use("/api/v2/attendances", attendanceRouter);

// Error Handling Middleware
app.all("*", (req, res, next) => {
  const error = new AppError(`This page ${req.url} does not exist`, 404);
  next(error);
});

// Global Error Controller
app.use(globalErrorController);
// cronJob.run();
module.exports = app;
