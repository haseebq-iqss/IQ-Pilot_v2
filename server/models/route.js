const mongoose = require("mongoose");

const routeSchema = new mongoose.Schema(
  {
    cab: {
      type: mongoose.Schema.ObjectId,
      ref: "Cab",
      required: true,
    },
    workLocation: {
      type: String,
      enum: ["Zaira Tower", "Rangreth"],
    },
    currentShift: String,
    passengers: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    shiftDate: {
      type: String,
    },
    typeOfRoute: {
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
