const mongoose = require("mongoose");
const validator = require("validator");

const employeeSchema = new mongoose.Schema(
  {
    fName: {
      type: String,
      required: [true, "Please provide your fname"],
    },
    lName: {
      type: String,
      required: [true, "Please provide your lname"],
    },
    phone: {
      type: String,
      required: [true, "Please provide your phone number"],
      minlength: 10,
      maxlength: 13,
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      validate: [validator.isEmail, "Please provide a valid email address"],
      unique: true,
    },
    role: {
      type: String,
      enum: ["admin", "driver", "employee"],
      required: [true, "Please provide a role"],
    },
    profilePicture: String,
    department: String,
    pickup: {
      type: {
        type: String,
        default: "Point",
        enum: "Point",
      },
      coordinates: [Number],
      description: String,
    },
    currenShift: String,
    workLocation: [
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
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"],
        },
        coordinates: [Number],
        description: String,
      },
    ],
  },
  { timestamp: true }
);

const Employee = mongoose.model("employee", employeeSchema);
module.exports = Employee;
