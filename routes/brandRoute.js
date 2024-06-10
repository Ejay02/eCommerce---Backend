const express = require('express');
const router = express.Router();
const { admin, authMiddleware } = require('../middlewares/authMiddleware');

const {
  createBrand,
  updateBrand,
  deleteBrand,
  getBrand,
  getBrands
} = require('../controller/brandController');

router.post('/', authMiddleware, admin, createBrand);
router.put('/:id', authMiddleware, admin, updateBrand);
router.delete('/:id', authMiddleware, admin, deleteBrand);
router.get('/:id', getBrand);
router.get('/', getBrands);

module.exports = router;
