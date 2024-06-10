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

router.post('/', authMiddleware, admin,  createProduct);
router.get('/:id',  getProduct);

router.put('/wishlist', authMiddleware, addToWishlist);
router.put('/rating', authMiddleware,  rating);

router.get('/',  getProducts);
router.put('/:id', authMiddleware, admin,  updateProduct);
router.delete('/:id', authMiddleware, admin,  deleteProduct);

module.exports = router;
