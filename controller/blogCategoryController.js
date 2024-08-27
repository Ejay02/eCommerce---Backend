const asyncHandler = require('express-async-handler');
const BlogCategory = require('../models/blogCategoryModel');
const validateMongoDbId = require('../utils/validateMongodbId');

const createCategory = asyncHandler(async (req, res) => {
  try {
    const newCategory = await BlogCategory.create(req.body);

    res.json(newCategory);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error creating blog category: ' + error.message
    });
  }
});

const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const updatedCategory = await BlogCategory.findByIdAndUpdate(id, req.body, {
      new: true
    });

    res.json(updatedCategory);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error updating blog category: ' + error.message
    });
  }
});

const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const delCategory = await BlogCategory.findByIdAndDelete({ _id: id });

    res.json(delCategory);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error deleting blog category: ' + error.message
    });
  }
});

const getCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const category = await BlogCategory.findById(id);

    res.json(category);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching blog category: ' + error.message
    });
  }
});

const getCategories = asyncHandler(async (req, res) => {
  try {
    let query = BlogCategory.find();

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
    const numBlogCat = await BlogCategory.countDocuments();

    // Check if page is out of range
    if (skip >= numBlogCat && page !== 1) throw new Error('This page does not exist');

    const allBlogCat = await query;
    res.json({ categories: allBlogCat, total: numBlogCat, page, limit });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching blog categories: ' + error.message
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
