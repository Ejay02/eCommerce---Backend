const asyncHandler = require('express-async-handler');
const Color = require('../models/colorModel');
const validateMongoDbId = require('../utils/validateMongodbId');

const createColor = asyncHandler(async (req, res) => {
  try {
    const newColor = await Color.create(req.body);

    res.json(newColor);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error creating product color: ' + error.message
    });
  }
});

const updateColor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const updatedColor = await Color.findByIdAndUpdate(id, req.body, {
      new: true
    });

    res.json(updatedColor);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error updating product color: ' + error.message
    });
  }
});

const deleteColor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const delColor = await Color.findByIdAndDelete({ _id: id });

    res.json(delColor);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error deleting product color: ' + error.message
    });
  }
});

const getColor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const color = await Color.findById(id);

    res.json(color);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching color: ' + error.message
    });
  }
});

const getColors = asyncHandler(async (req, res) => {
  try {
    const colors = await Color.find();

    res.json(colors);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching colors: ' + error.message
    });
  }
});

module.exports = {
  getColor,
  getColors,
  createColor,
  updateColor,
  deleteColor
};
