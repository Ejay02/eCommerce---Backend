const asyncHandler = require("express-async-handler");
const Product = require("../models/productModel");
const slugify = require("slugify");

const createProduct = asyncHandler(async (req, res) => {
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    const newProduct = await Product.create(req.body);

    res.json(newProduct);
  } catch (error) {
    throw new Error(error);
  }
});

const getProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findById(id);
    res.json(product);
  } catch (error) {
    throw new Error(error);
  }
});

const getProducts = asyncHandler(async (req, res) => {
  try {
    const queryObj = { ...req.query };
    console.log("queryObj:", queryObj);
    const allProducts = await Product.where("category").equals(
      req.query.category
    );
    // const allProducts = await Product.find({
    //   brand: req.query.brand,
    //   category: req.query.category,

    // });
    res.json(allProducts);
  } catch (error) {
    throw new Error(error);
  }
});

const updateProduct = asyncHandler(async (req, res) => {
  const id = req.params.id;
  console.log("id:", id);
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }

    const update = await Product.findOneAndUpdate({ _id: id }, req.body, {
      new: true,
    });
    res.json(update);
  } catch (error) {
    throw new Error(error);
  }
});

const deleteProduct = asyncHandler(async (req, res) => {
  const id = req.params.id;

  try {
    const del = await Product.findByIdAndDelete({ _id: id });
    res.json(del);
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createProduct,
  getProduct,
  getProducts,
  updateProduct,
  deleteProduct,
};
