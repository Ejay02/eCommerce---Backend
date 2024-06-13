/* eslint-disable no-console */
/* eslint-disable no-unused-vars */

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const handleImageUpload = async (file, folder) => {
  try {
    const data = await cloudinary.uploader
      .upload(file, {
        public_id: `${Date.now()}-${file.original_filename}`,
        folder,
        // moderation: 'duplicate:0.8',
        // Apply auto-crop transformation
        transformation: [
          {
            crop: 'auto',
            gravity: 'auto',
            width: 500,
            height: 500
          },
          { quality: 'auto' },
          { fetch_format: 'auto' }
        ]
      })
      .catch((error) => {
        console.log(error);
      });

    return data.url;
  } catch (error) {
    console.log('Error uploading file to Cloudinary: ' + error.message);
    return null;
  }
};

const handleProdImgUpload = async (image) => {
  return handleImageUpload(image, 'buyzone/products');
};

const handleBlogImgUpload = async (file) => {
  return handleImageUpload(file, 'buyzone/blogs');
};

module.exports = { handleProdImgUpload, handleBlogImgUpload };
