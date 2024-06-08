const express = require('express');
const router = express.Router();
const { admin, authMiddleware } = require('../middlewares/authMiddleware');
const { errorHandler } = require('../middlewares/errorHandler');

const {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategory,
  getCategories
} = require('../controller/productCategoryController');

router.post('/', authMiddleware, admin, errorHandler, createCategory);
router.put('/:id', authMiddleware, admin, errorHandler, updateCategory);
router.delete('/:id', authMiddleware, admin, errorHandler, deleteCategory);
router.get('/:id', errorHandler, getCategory);
router.get('/', errorHandler, getCategories);

module.exports = router;
