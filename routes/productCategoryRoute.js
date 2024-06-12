const express = require('express');
const router = express.Router();
const { admin, authMiddleware } = require('../middlewares/authMiddleware');

const {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategory,
  getCategories
} = require('../controller/productCategoryController');

router.post('/', authMiddleware, admin, createCategory);
router.put('/:id', authMiddleware, admin, updateCategory);
router.delete('/:id', authMiddleware, admin, deleteCategory);
router.get('/:id', getCategory);
router.get('/', getCategories);

module.exports = router;
