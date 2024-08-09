const fs = require('fs');
const slugify = require('slugify');
const User = require('../models/userModel');
const Product = require('../models/productModel');
const asyncHandler = require('express-async-handler');
const validateMongoDbId = require('../utils/validateMongodbId');

const { handleProdImgUpload, handleImageDelete } = require('../utils/cloudinary');

const createProduct = asyncHandler(async (req, res) => {
  try {
    let { title, tags, colors, ...otherProductData } = req.body;

    // Create slug from title
    if (title) {
      otherProductData.slug = slugify(title);
    }

    // Handle tags
    if (tags) {
      // If tags is a string, split it into an array
      if (typeof tags === 'string') {
        tags = tags.split(',').map((tag) => tag.trim());
      }
      // If tags is an array of strings (from FormData), convert it to a regular array
      else if (Array.isArray(tags) && tags.every((tag) => typeof tag === 'string')) {
        tags = tags.map((tag) => tag.trim());
      }
      // If tags is already an array, keep it as is
      else if (!Array.isArray(tags)) {
        tags = [];
      }
    } else {
      tags = [];
    }

    //handle colors
    if (colors) {
      if (typeof colors === 'object' && colors !== null) {
        // Check if colors is the object we're receiving
        if ('' in colors && typeof colors[''] === 'string') {
          // Use the string value if it exists
          colors = colors[''].split(',').map((color) => color.trim());
        } else {
          // Otherwise, collect all non-empty string values
          colors = Object.values(colors).filter(
            (color) => typeof color === 'string' && color.trim() !== ''
          );
        }
      } else if (typeof colors === 'string') {
        colors = colors.split(',').map((color) => color.trim());
      } else if (Array.isArray(colors)) {
        colors = colors.filter((color) => typeof color === 'string' && color.trim() !== '');
      } else {
        colors = [];
      }
    } else {
      colors = [];
    }

    // Handle image uploads
    let uploadedImages = [];
    if (req.files && req.files.length > 0) {
      uploadedImages = await Promise.all(req.files.map((file) => handleProdImgUpload(file)));
    }

    // Create product with uploaded images
    const newProduct = await Product.create({
      title,
      tags,
      colors,
      images: uploadedImages,
      ...otherProductData
    });

    // Delete temporary files
    if (req.files) {
      req.files.forEach((file) => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    res.json(newProduct);
  } catch (error) {
    // Delete temporary files in case of error
    if (req.files) {
      req.files.forEach((file) => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
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

    // Apply filters, sorting, and field selection
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

    // Get the total count of products
    const numProducts = await Product.countDocuments();
    if (skip >= numProducts && page !== 1) throw new Error('This page does not exist');

    const allProducts = await query;
    res.json({ products: allProducts, total: numProducts, page, limit });
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
    let { title, ...otherProductData } = req.body;

    if (title) {
      otherProductData.slug = slugify(title);
    }

    // Handle image uploads
    let uploadedImages = [];
    if (req.files && req.files.length > 0) {
      uploadedImages = await Promise.all(req.files.map((file) => handleProdImgUpload(file)));

      // Get the existing product to merge new images with existing ones
      const existingProduct = await Product.findById(id);
      otherProductData.images = [...existingProduct.images, ...uploadedImages];
    }

    const update = await Product.findOneAndUpdate(
      { _id: id },
      { title, ...otherProductData },
      { new: true }
    );

    // Delete temporary files
    if (req.files) {
      req.files.forEach((file) => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }

    res.json(update);
  } catch (error) {
    // Delete temporary files in case of error
    if (req.files) {
      req.files.forEach((file) => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
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
      const _updateRating = await Product.updateOne(
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
      const _rate = await Product.findByIdAndUpdate(
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

const uploadImages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    let images = req.body.images;

    // Ensure images is an array
    if (!Array.isArray(images)) {
      if (images) {
        images = [images];
      } else {
        images = [];
      }
    }

    const uploadedImages = await Promise.all(images.map((image) => handleProdImgUpload(image)));

    const findProduct = await Product.findByIdAndUpdate(
      id,
      {
        images: uploadedImages
      },
      { new: true }
    );

    res.json(findProduct);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error uploading product image(s): ' + error.message
    });
  }
});

const deleteImage = asyncHandler(async (req, res) => {
  const { id, public_id } = req.params;

  validateMongoDbId(id);

  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ status: 'error', message: 'Product not found' });
    }

    // Delete the image from Cloudinary
    await handleImageDelete(public_id);

    // Remove the image from the product's images array
    product.images = product.images.filter((imageUrl) => !imageUrl.includes(public_id));
    await product.save();

    res.json({ status: 'success', message: 'Image deleted successfully' });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error deleting image: ' + error.message
    });
  }
});

module.exports = {
  rating,
  getProduct,
  getProducts,
  deleteImage,
  uploadImages,
  addToWishlist,
  deleteProduct,
  createProduct,
  updateProduct,
  addToWishlist
};
