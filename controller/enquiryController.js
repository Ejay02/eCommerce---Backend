const asyncHandler = require('express-async-handler');
const Enquiry = require('../models/enquiryModel');
const validateMongoDbId = require('../utils/validateMongodbId');

const createEnquiry = asyncHandler(async (req, res) => {
  try {
    const newEnquiry = await Enquiry.create(req.body);

    res.json(newEnquiry);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error creating product enquiry: ' + error.message
    });
  }
});

const updateEnquiry = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const updatedEnquiry = await Enquiry.findByIdAndUpdate(id, req.body, {
      new: true
    });

    res.json(updatedEnquiry);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error updating product enquiry: ' + error.message
    });
  }
});

const deleteEnquiry = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const delEnquiry = await Enquiry.findByIdAndDelete({ _id: id });

    res.json(delEnquiry);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error deleting product enquiry: ' + error.message
    });
  }
});

const getEnquiry = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const enquiry = await Enquiry.findById(id);

    res.json(enquiry);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching enquiry: ' + error.message
    });
  }
});

const getEnquires = asyncHandler(async (req, res) => {
  try {
    const enquires = await Enquiry.find();

    res.json(enquires);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching enquires: ' + error.message
    });
  }
});

module.exports = {
  getEnquiry,
  getEnquires,
  createEnquiry,
  updateEnquiry,
  deleteEnquiry
};
