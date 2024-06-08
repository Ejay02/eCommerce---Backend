const express = require('express');
const router = express.Router();
const { admin, authMiddleware } = require('../middlewares/authMiddleware');
const { errorHandler } = require('../middlewares/errorHandler');

const {
  createBrand,
  updateBrand,
  deleteBrand,
  getBrand,
  getBrands
} = require('../controller/brandController');

router.post('/', authMiddleware, admin, errorHandler, createBrand);
router.put('/:id', authMiddleware, admin, errorHandler, updateBrand);
router.delete('/:id', authMiddleware, admin, errorHandler, deleteBrand);
router.get('/:id', errorHandler, getBrand);
router.get('/', errorHandler, getBrands);

module.exports = router;
