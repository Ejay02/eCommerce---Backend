const asyncHandler = require('express-async-handler');
const ProductCategory = require('../models/productCategoryModel');
const validateMongoDbId = require('../utils/validateMongodbId');

const createCategory = asyncHandler(async (req, res) => {
  try {
    const newCategory = await ProductCategory.create(req.body);

    res.json(newCategory);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error creating product category: ' + error.message
    });
  }
});

const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const updatedCategory = await ProductCategory.findByIdAndUpdate(id, req.body, {
      new: true
    });

    res.json(updatedCategory);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error updating product category: ' + error.message
    });
  }
});

const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const delCategory = await ProductCategory.findByIdAndDelete({ _id: id });

    res.json(delCategory);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error deleting product category: ' + error.message
    });
  }
});

const getCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const category = await ProductCategory.findById(id);

    res.json(category);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching product category: ' + error.message
    });
  }
});

const getCategories = asyncHandler(async (req, res) => {
  try {
    let query = ProductCategory.find();

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
    const numProdCat = await ProductCategory.countDocuments();

    // Check if page is out of range
    if (skip >= numProdCat && page !== 1) throw new Error('This page does not exist');

    const allProdCat = await query;
    res.json({ categories: allProdCat, total: numProdCat, page, limit });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching product categories: ' + error.message
    });
  }
});

module.exports = {
  getCategory,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
