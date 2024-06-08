const express = require('express');
const router = express.Router();

const { admin, authMiddleware } = require('../middlewares/authMiddleware');
const {
  createBlog,
  updateBlog,
  getBlog,
  getBlogs,
  deleteBlog,
  likeBlog,
  dislikeBlog
} = require('../controller/blogController');
const { errorHandler } = require('../middlewares/errorHandler');

router.post('/', authMiddleware, admin, errorHandler, createBlog);
router.put('/likes', authMiddleware, errorHandler, likeBlog);
router.put('/dislikes', authMiddleware, errorHandler, dislikeBlog);

router.put('/:id', authMiddleware, admin, errorHandler, updateBlog);
router.get('/:id', errorHandler, getBlog);
router.get('/', errorHandler, getBlogs);

router.delete('/:id', authMiddleware, admin, errorHandler, deleteBlog);

module.exports = router;
