const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const cabRoutes = require("./routes/cabRoutes");
const authRoutes = require("./routes/authRoutes");
const AppError = require("./utils/appError");
const globalErrorController = require("./controller/errorController");
const usersRoutes = require("./routes/usersRoutes");
const routeRouter = require("./routes/routeRoute");
const app = express();

// Middlewares
app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:5173", "http://localhost:5174"],
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

app.all("*", (req, res, next) => {
  const error = new AppError(`This page ${req.url} does not exist`, 404);
  next(error);
});

app.use(globalErrorController);
module.exports = app;
