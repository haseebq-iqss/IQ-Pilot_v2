const mongoose = require("mongoose");

const cabSchema = new mongoose.Schema({
  cabDriver: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "Please provide the cab driver"],
    unique: true,
  },
  cabNumber: {
    type: String,
    required: [true, "Please provide the cab number"],
    unique: true,
  },
  seatingCapacity: {
    type: Number,
    required: [true, "Please provide the seating capacity for the cab"],
    unique: false,
  },
  numberPlate: {
    type: String,
    required: [true, "Please provide the number-plate of the cab "],
    unique: true,
  },
  carModel: {
    type: String,
    required: [true, "Please provide the car model"],
  },
  carColor: {
    type: String,
    required: [true, "Please provide the car color"],
  },
  mileage: {
    type: String,
    required: [true, "Please provide the mileage of the cab"],
    unique: false,
  },
  androidSetup: {
    type: Boolean,
    required: [
      true,
      "Please confirm if the Android setup is installed in the cab.",
    ],
    default: false,
  },
  acInstalled: {
    type: Boolean,
    required: [true, "Please confirm if the AC is installed in the cab."],
    default: false,
  },
  typeOfCab: {
    type: String,
    default: "personal", // personal or vendor
  }
});

const Cab = mongoose.model("Cab", cabSchema);
module.exports = Cab;
