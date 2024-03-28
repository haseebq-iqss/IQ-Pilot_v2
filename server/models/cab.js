const mongoose = require("mongoose");

const cabSchema = new mongoose.Schema(
  {
    cabDriver: {
      type: mongoose.Schema.ObjectId,
      ref: "employee",
      required: true,
    },
    cabNumber: {
      type: String,
      required: [true, "Please provude your cab Number"],
    },
    seatingCapacity: {
      type: Number,
      required: [true, "Please provide your seating capacity"],
    },
    numberPlate: {
      type: String,
      required: [true, "Please provide your email"],
    },
    carModel: {
      type: String,
      required: [true, "Please provide a car model"],
    },
    carColor: {
      type: String,
      required: [true, "Please provide a car color"],
    },
  },
  { timestamp: true }
);

const Cab = mongoose.model("cab", cabSchema);
module.exports = Cab;
