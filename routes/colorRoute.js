const express = require('express');
const router = express.Router();
const { admin, authMiddleware } = require('../middlewares/authMiddleware');

const {
  createColor,
  updateColor,
  deleteColor,
  getColor,
  getColors
} = require('../controller/colorController');

router.post('/', authMiddleware, admin, createColor);
router.put('/:id', authMiddleware, admin, updateColor);
router.delete('/:id', authMiddleware, admin, deleteColor);
router.get('/:id', getColor);
router.get('/', getColors);

module.exports = router;
