const asyncHandler = require('express-async-handler');
const Product = require('../models/productModel');
const slugify = require('slugify');
const validateMongoDbId = require('../utils/validateMongodbId');
const User = require('../models/userModel');

const createProduct = asyncHandler(async (req, res) => {
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    const newProduct = await Product.create(req.body);

    res.json(newProduct);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error creating product: ' + error.message
    });
  }
});

const getProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const product = await Product.findById(id);
    res.json(product);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching product: ' + error.message
    });
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
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Limiting the fields
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }

    // Pagination
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 10;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    if (req.query.page) {
      const numProducts = await Product.countDocuments();
      if (skip >= numProducts) throw new Error('This page does not exist');
    }

    const allProducts = await query;
    res.json(allProducts);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching products: ' + error.message
    });
  }
});

const updateProduct = asyncHandler(async (req, res) => {
  const id = req.params.id;
  validateMongoDbId(id);

  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }

    const update = await Product.findOneAndUpdate({ _id: id }, req.body, {
      new: true
    });
    res.json(update);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error updating product: ' + error.message
    });
  }
});

const deleteProduct = asyncHandler(async (req, res) => {
  const id = req.params.id;
  validateMongoDbId(id);

  try {
    const del = await Product.findByIdAndDelete({ _id: id });
    res.json(del);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error deleting product: ' + error.message
    });
  }
});

const addToWishlist = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { productId } = req.body;

  try {
    const user = await User.findById(_id);
    const added = user.wishlist.find((id) => id.toString() === productId);

    if (added) {
      let user = await User.findByIdAndUpdate(
        _id,
        {
          $pull: { wishlist: productId }
        },
        { new: true }
      );
      res.json(user);
    } else {
      let user = await User.findByIdAndUpdate(
        _id,
        {
          $push: { wishlist: productId }
        },
        { new: true }
      );
      res.json(user);
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error adding product to wishlist: ' + error.message
    });
  }
});

const rating = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { star, productId, comment } = req.body;

  try {
    const product = await Product.findById(productId);

    let rated = product.ratings.find((userId) => userId.postedBy.toString() === _id.toString());

    if (rated) {
      const updateRating = await Product.updateOne(
        {
          ratings: { $elemMatch: rated }
        },

        {
          $set: { 'ratings.$.star': star, 'ratings.$.comment': comment }
        },
        {
          new: true
        }
      );
      // res.json(updateRating);
    } else {
      const rate = await Product.findByIdAndUpdate(
        productId,
        {
          $push: {
            ratings: {
              star: star,
              comment: comment,
              postedBy: _id
            }
          }
        },
        { new: true }
      );
      // res.json(rate);
    }

    const rates = await Product.findById(productId);

    let ratingss = rates.ratings.length;

    let sumRatings = rates.ratings.map((item) => item.star).reduce((prev, curr) => prev + curr, 0);

    let actRating = Math.round(sumRatings / ratingss);

    let finalProduct = await Product.findByIdAndUpdate(
      productId,
      {
        totalRating: actRating
      },
      { new: true }
    );
    res.json(finalProduct);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error adding rating: ' + error.message
    });
  }
});

module.exports = {
  rating,
  getProduct,
  getProducts,
  addToWishlist,
  deleteProduct,
  createProduct,
  updateProduct,
  addToWishlist
};
