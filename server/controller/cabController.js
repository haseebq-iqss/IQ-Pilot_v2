const Cab = require("../models/cab");
const User = require("../models/user");
const AppError = require("../utils/appError");
const { catchAsync } = require("../utils/catchAsync");

exports.createCab = catchAsync(async (req, res, next) => {
  const cab = await Cab.create(req.body);
  res.status(201).json({ status: "Success", data: cab });
});

exports.updateCab = catchAsync(async (req, res, next) => {
  const updated_cab = await Cab.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate("cabDriver");
  if (!updated_cab) {
    return next(new AppError(`No cab with this id`, 404));
  }
  res.status(201).json({ status: "Success", data: updated_cab });
});

exports.deleteCab = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const deleted_cab = await Cab.findByIdAndDelete(id);
  if (!deleted_cab) {
    return next(new AppError(`No document found with this id`, 404));
  }
  await User.findByIdAndDelete(deleted_cab.cabDriver);
  res.status(204).json({ status: "Success" });
});

exports.getAllCabs = catchAsync(async (req, res, next) => {
  const cabs = await Cab.find({}).populate("cabDriver");
  if (!cabs) return next(new AppError(`No cabs available...`, 404));
  res.status(200).json({ status: "Success", results: cabs.length, data: cabs });
});

exports.getCabByDriver = catchAsync(async (req, res, next) => {
  const cab = await Cab.find({ cabDriver: req.params.id }).populate(
    "cabDriver"
  );
  if (cab.length === 0)
    return next(new AppError(`No cab for this driver...`, 404));
  res.status(200).json({ status: "Success", data: cab });
});
