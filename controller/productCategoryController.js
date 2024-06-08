const asyncHandler = require("express-async-handler");
const ProductCategory = require("../models/productCategoryModel");
const validateMongoDbId = require("../utils/validateMongodbId");

const createCategory = asyncHandler(async (req, res) => {
  try {
    const newCategory = await ProductCategory.create(req.body);

    res.json(newCategory);
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error creating product category: " + error.message,
    });
  }
});

const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const updatedCategory = await ProductCategory.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
      }
    );

    res.json(updatedCategory);
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error updating product category: " + error.message,
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
      status: "error",
      message: "Error deleting product category: " + error.message,
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
      status: "error",
      message: "Error getting product category: " + error.message,
    });
  }
});

const getCategories = asyncHandler(async (req, res) => {
  try {
    const categories = await ProductCategory.find();

    res.json(categories);
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error getting product category: " + error.message,
    });
  }
});

module.exports = {
  getCategory,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
