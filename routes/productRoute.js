const express = require('express');
const router = express.Router();
const {
  createProduct,
  getProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  addToWishlist,
  rating
} = require('../controller/productController');
const { admin, authMiddleware } = require('../middlewares/authMiddleware');
const { errorHandler } = require('../middlewares/errorHandler');

router.post('/', authMiddleware, admin, errorHandler, createProduct);
router.get('/:id', errorHandler, getProduct);

router.put('/wishlist', authMiddleware, addToWishlist);
router.put('/rating', authMiddleware, errorHandler, rating);

router.get('/', errorHandler, getProducts);
router.put('/:id', authMiddleware, admin, errorHandler, updateProduct);
router.delete('/:id', authMiddleware, admin, errorHandler, deleteProduct);

module.exports = router;
