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

router.post('/', authMiddleware, admin,  createBlog);
router.put('/likes', authMiddleware,  likeBlog);
router.put('/dislikes', authMiddleware,  dislikeBlog);

router.put('/:id', authMiddleware, admin,  updateBlog);
router.get('/:id',  getBlog);
router.get('/',  getBlogs);

router.delete('/:id', authMiddleware, admin,  deleteBlog);

module.exports = router;
