const mongoose = require("mongoose");
const validator = require("validator");

const attendanceSchema = new mongoose.Schema(
  {
    ofEmployee: {
      type: mongoose.Schema.ObjectId,
      ref: "employee",
      required: true,
    },
    ofRoute: {
      type: mongoose.Schema.ObjectId,
      ref: "route",
      required: true,
    },
    isPresent: Boolean,
  },
  { timestamp: true }
);

const Attendance = mongoose.model("attendance", attendanceSchema);
module.exports = Attendance;
