const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    ofEmployee: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    ofRoute: {
      type: mongoose.Schema.ObjectId,
      ref: "route",
      required: true,
    },
    isPresent: Boolean,
    onLeave: {
      type: {
        type: Boolean,
        default: false,
      },
      numDays: {
        type: Number,
        default: 0,
      },
    },
  },
  { timestamps: true }
);

const Attendance = mongoose.model("attendance", attendanceSchema);
module.exports = Attendance;
