const asyncHandler = require('express-async-handler');
const Brand = require('../models/brandModel');
const validateMongoDbId = require('../utils/validateMongodbId');

const createBrand = asyncHandler(async (req, res) => {
  try {
    const newBrand = await Brand.create(req.body);

    res.json(newBrand);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error creating product brand: ' + error.message
    });
  }
});

const updateBrand = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const updatedBrand = await Brand.findByIdAndUpdate(id, req.body, {
      new: true
    });

    res.json(updatedBrand);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error updating product brand: ' + error.message
    });
  }
});

const deleteBrand = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const delBrand = await Brand.findByIdAndDelete({ _id: id });

    res.json(delBrand);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error deleting product brand: ' + error.message
    });
  }
});

const getBrand = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const brand = await Brand.findById(id);

    res.json(brand);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching brand: ' + error.message
    });
  }
});

const getBrands = asyncHandler(async (req, res) => {
  try {
    const brands = await Brand.find();

    res.json(brands);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching brands: ' + error.message
    });
  }
});

module.exports = {
  getBrand,
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand
};
