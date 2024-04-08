const Cab = require("../models/cab");
const AppError = require("../utils/appError");
const { catchAsync } = require("../utils/catchAsync");

//create cab
const createCab = catchAsync(async function (req, res, next) {
  const cab = await Cab.create(req.body);
  res.status(200).json({ message: "Success", cab });
});

// get cab details
const getCabDetails = catchAsync(async function (req, res, next) {
  const cab = await Cab.find();
  if (!cab) {
    return next(new AppError("No Cab  found", 404));
  }
  res.status(200).json({ message: "Success", cab });
});

// get cab by id
const getCab = catchAsync(async function (req, res, next) {
  const cab = await Cab.findById(req.params.id);
  if (!cab) {
    return next(new AppError("No Cab found", 404));
  }
  res.status(200).json({ message: "Success", cab });
});

// update cab
const updateCab = catchAsync(async function (req, res, next) {
  const cab = await Cab.findOneAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!cab) {
    return next(new AppError("No Cab found", 404));
  }
  res.status(200).json({ message: "Success", cab });
});

// delete cab

const deleteCab = catchAsync(async function (req, res, next) {
  await Cab.findOneAndDelete(req.params.id);
  res.status(200).json({ message: "Success" });
});

module.exports = {
  createCab,
  getCabDetails,
  getCab,
  updateCab,
  deleteCab,
};
