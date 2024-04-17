const mongoose = require("mongoose");

const routeSchema = new mongoose.Schema(
  {
    cab: {
      type: mongoose.Schema.ObjectId,
      ref: "cab",
      required: true,
    },
    passengers: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "employee",
        required: true,
      },
    ],
    shiftTime: {
      type: String,
      required: true,
    },
    shiftDate: {
      type: String,
      required: true,
    },
    typeofRoute: {
      type: String,
      enum: ["pickup", "drop", "supply"],
      required: true,
    },
    routeStatus: {
      type: String,
      enum: ["notStarted", "inProgress", "completed"],
      default: "notStarted",
    },
    estimatedTime: {
      type: Number,
    },
    cabPath: [
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"],
        },
        // LonLat
        coordinates: [Number],
        description: String,
      },
    ],
    totalDistance: {
      type: Number,
    },
  },
  { timestamp: true }
);

const Route = mongoose.model("route", routeSchema);
module.exports = Route;
