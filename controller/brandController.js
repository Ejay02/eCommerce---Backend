const asyncHandler = require('express-async-handler');
const Brand = require('../models/brandModel');
const validateMongoDbId = require('../utils/validateMongodbId');

const createBrand = asyncHandler(async (req, res) => {
  try {
    const { title } = req.body;
    const existingBrand = await Brand.findOne({ title });

    if (existingBrand) {
      return res.status(400).json({
        status: 'error',
        message: 'Brand with this title already exists'
      });
    }

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
    let query = Brand.find();

    // Pagination
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 10;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    // Get the total count of brands
    const numBrands = await Brand.countDocuments();

    // Check if page is out of range
    if (skip >= numBrands && page !== 1) throw new Error('This page does not exist');

    const allBrands = await query;
    res.json({ brands: allBrands, total: numBrands, page, limit });
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
