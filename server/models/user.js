const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");

const pickupSchema = new mongoose.Schema({
  type: {
    type: String,
    default: "Point",
    enum: ["Point"],
  },
  coordinates: [Number],
  address: String,
  description: String,
});

const userSchema = new mongoose.Schema(
  {
    fname: {
      type: String,
      required: [true, "Please provide your fname"],
    },
    lname: {
      type: String,
      required: [true, "Please provide your lname"],
    },
    password: {
      type: String,
      select: false,
      required: [true, "Please provide your password"],
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
    pickUp: {
      type: pickupSchema,
      // required: [true, "Please provide your location"],
    },
    currenShift: String,
    workLocation: {
      type: String,
      enum: ["Zaira Tower", "Rangreth"],
    },
  },
  { timestamp: true }
);
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
userSchema.methods.checkPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
const User = mongoose.model("User", userSchema);
module.exports = User;
