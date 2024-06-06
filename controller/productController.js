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
    let query = Product.find();

    // Filter
    if (req.query.category) {
      query = query.find({ category: req.query.category });
    }

    if (req.query.price) {
      const priceQuery = {};
      if (req.query.price.gte) {
        priceQuery.price = { $gte: req.query.price.gte };
      }
      if (req.query.price.lte) {
        priceQuery.price = { $lte: req.query.price.lte };
      }
      if (req.query.price.gt) {
        priceQuery.price = { $gt: req.query.price.gt };
      }
      if (req.query.price.lt) {
        priceQuery.price = { $lt: req.query.price.lt };
      }
      query = query.find(priceQuery);
    }

    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    // Limiting the fields
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v");
    }

    // Pagination
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 10;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    if (req.query.page) {
      const numProducts = await Product.countDocuments();
      if (skip >= numProducts) throw new Error("This page does not exist");
    }

    const allProducts = await query;
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
