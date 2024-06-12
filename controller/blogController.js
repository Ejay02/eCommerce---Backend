const Blog = require('../models/blogModel');
const User = require('../models/userModel');
const asyncHandler = require('express-async-handler');
const validateMongoDbId = require('../utils/validateMongodbId');
const { handleBlogImgUpload } = require('../utils/cloudinary');

const createBlog = asyncHandler(async (req, res) => {
  try {
    const newBlog = await Blog.create(req.body);

    res.json(newBlog);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error creating blog: ' + error.message
    });
  }
});

const updateBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const updateBlog = await Blog.findByIdAndUpdate(id, req.body, {
      new: true
    });
    res.json(updateBlog);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error updating blog: ' + error.message
    });
  }
});

const getBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const blog = await Blog.findById(id).populate('likes').populate('dislikes');

    const updateViews = await Blog.findByIdAndUpdate(
      id,
      {
        $inc: { numViews: 1 }
      },
      {
        new: true
      }
    );
    res.json(blog);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching blog: ' + error.message
    });
  }
});

const getBlogs = asyncHandler(async (req, res) => {
  try {
    const blogs = await Blog.find();

    res.json(blogs);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching blogs: ' + error.message
    });
  }
});

const deleteBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const deleteBlog = await Blog.findByIdAndDelete(id);
    res.json(deleteBlog);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error deleting blog: ' + error.message
    });
  }
});

const likeBlog = asyncHandler(async (req, res) => {
  try {
    const { blogId } = req.body;

    validateMongoDbId(blogId);

    const blog = await Blog.findById(blogId);
    const curUserId = req?.user?._id;

    const liked = blog?.liked;

    const alreadyDisliked = blog?.dislikes?.find(
      (userId) => userId?.toString() === curUserId?.toString()
    );

    if (alreadyDisliked) {
      const blog = await Blog.findByIdAndUpdate(
        blogId,
        {
          $pull: { dislikes: curUserId },
          disliked: false
        },
        { new: true }
      );
      res.json(blog);
    }

    if (liked) {
      const blog = await Blog.findByIdAndUpdate(
        blogId,
        {
          $pull: { likes: curUserId },
          liked: false
        },
        { new: true }
      );
      res.json(blog);
    } else {
      const blog = await Blog.findByIdAndUpdate(
        blogId,
        {
          $push: { likes: curUserId },
          liked: true
        },
        { new: true }
      );
      res.json(blog);
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error liking blog: ' + error.message
    });
  }
});

const dislikeBlog = asyncHandler(async (req, res) => {
  try {
    const { blogId } = req.body;

    validateMongoDbId(blogId);

    const blog = await Blog.findById(blogId);
    const curUserId = req?.user?._id;

    const disliked = blog?.disliked;

    const alreadyLiked = blog?.likes?.find(
      (userId) => userId?.toString() === curUserId?.toString()
    );

    if (alreadyLiked) {
      const blog = await Blog.findByIdAndUpdate(
        blogId,
        {
          $pull: { likes: curUserId },
          liked: false
        },
        { new: true }
      );
      res.json(blog);
    }

    if (disliked) {
      const blog = await Blog.findByIdAndUpdate(
        blogId,
        {
          $pull: { dislikes: curUserId },
          disliked: false
        },
        { new: true }
      );
      res.json(blog);
    } else {
      const blog = await Blog.findByIdAndUpdate(
        blogId,
        {
          $push: { dislikes: curUserId },
          disliked: true
        },
        { new: true }
      );
      res.json(blog);
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error disliking blog: ' + error.message
    });
  }
});

const uploadImages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    let images = req.body.images;

    // Ensure images is an array
    if (!Array.isArray(images)) {
      if (images) {
        images = [images];
      } else {
        images = [];
      }
    }

    const uploadedImages = await Promise.all(images.map((image) => handleBlogImgUpload(image)));

    const findBlog = await Blog.findByIdAndUpdate(
      id,
      {
        images: uploadedImages
      },
      {
        new: true
      }
    );
    res.json(findBlog);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error uploading blog image(s): ' + error.message
    });
  }
});

module.exports = {
  getBlog,
  getBlogs,
  likeBlog,
  createBlog,
  updateBlog,
  deleteBlog,
  dislikeBlog,
  uploadImages
};
