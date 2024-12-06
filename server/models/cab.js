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
    type: Number,
    required: [true, "Please provide the mileage of the cab"],
    unique: false,
  },
  androidSetup: {
    type: Boolean,
    required: [
      true,
      "Please confirm if the Android setup is installed in the cab.",
    ],
  },
  acInstalled: {
    type: Boolean,
    default: false,
  },
  typeOfCab: {
    type: String,
    required: [true, "Please provide the type of cab."],
    enum: ["inHouse", "vendor"],
  },
});

const Cab = mongoose.model("Cab", cabSchema);
module.exports = Cab;
