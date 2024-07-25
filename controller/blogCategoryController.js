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

// const getCategories = asyncHandler(async (req, res) => {
//   try {
//     const categories = await BlogCategory.find();

//     res.json(categories);
//   } catch (error) {
//     res.status(500).json({
//       status: 'error',
//       message: 'Error fetching blog categories: ' + error.message
//     });
//   }
// });

const getCategories = asyncHandler(async (req, res) => {
  try {
    // Fetch categories sorted by updatedAt in descending order
    const categories = await BlogCategory.find().sort({ updatedAt: -1 });

    res.json(categories);
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
