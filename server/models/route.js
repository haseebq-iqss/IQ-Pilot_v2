const mongoose = require("mongoose");

const routeSchema = new mongoose.Schema({
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
  cabPath: {
    type: [[Number, Number]],
    default: [],
  },
  daysRouteIsActive: {
    type: Number,
    default: 1,
  },
  totalDistance: {
    type: Number,
  },
  availableCapacity: Number,
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Route = mongoose.model("route", routeSchema);
module.exports = Route;
