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
    let query = Enquiry.find();

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Sorting
    const sortField = req.query.sort || 'createdAt'; // Default sort field
    const sortOrder = req.query.order === 'asc' ? 1 : -1; // Default sort order is descending

    // Apply sorting to query
    query = query.sort({ [sortField]: sortOrder });

    // Apply pagination to query
    query = query.skip(skip).limit(limit);

    // Get the total count
    const numEnquiry = await Enquiry.countDocuments();

    // Check if page is out of range
    if (skip >= numEnquiry && page !== 1) throw new Error('This page does not exist');

    const allEnquiries = await query;
    res.json({ enquiries: allEnquiries, total: numEnquiry, page, limit });
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
