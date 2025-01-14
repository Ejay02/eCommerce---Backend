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
  uploadImages,
  deleteImage
} = require('../controller/productController');
const { admin, authMiddleware } = require('../middlewares/authMiddleware');
const { uploadProductPhoto } = require('../middlewares/uploadImages');

router.post('/', authMiddleware, admin, uploadProductPhoto.array('images', 10), createProduct);

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

router.put('/:id', authMiddleware, admin, uploadProductPhoto.array('images', 10), updateProduct);

router.delete('/:id', authMiddleware, admin, deleteProduct);
router.delete('/:id/delete-image/:public_id', authMiddleware, admin, deleteImage);

module.exports = router;
