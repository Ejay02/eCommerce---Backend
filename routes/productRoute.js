const express = require('express');
const router = express.Router();
const {
  createProduct,
  getProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  addToWishlist,
  rating,
  uploadImages
} = require('../controller/productController');
const { admin, authMiddleware } = require('../middlewares/authMiddleware');
const { uploadProductPhoto } = require('../middlewares/uploadImages');

router.post('/', authMiddleware, admin, createProduct);

router.put(
  '/upload/:id',
  authMiddleware,
  admin,
  uploadProductPhoto.array('images', 10),
  uploadImages
);

router.get('/:id', getProduct);

router.put('/wishlist', authMiddleware, addToWishlist);
router.put('/rating', authMiddleware, rating);

router.get('/', getProducts);
router.put('/:id', authMiddleware, admin, updateProduct);
router.delete('/:id', authMiddleware, admin, deleteProduct);

module.exports = router;
