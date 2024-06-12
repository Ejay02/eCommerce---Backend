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
        folder
      })
      .catch((error) => {
        console.log(error);
      });

    return data;
  } catch (error) {
    console.log('Error uploading file to Cloudinary: ' + error.message);
    return null;
  }
};

// // Optimize delivery by resizing and applying auto-format and auto-quality
const optimizeUrl = cloudinary.url('shoes', {
  fetch_format: 'auto',
  quality: 'auto'
});

// // Transform the image: auto-crop to square aspect_ratio
const autoCropUrl = cloudinary.url('shoes', {
  crop: 'auto',
  gravity: 'auto',
  width: 500,
  height: 500
});

const handleProdImgUpload = async (image) => {
  return handleImageUpload(image, 'buyzone/products');
};

const handleBlogImgUpload = async (file) => {
  return handleImageUpload(file, 'buyzone/blogs');
};

// const handleProdImgUpload = async (image) => {
//   const uploadedImage = await handleImageUpload(image, 'buyzone/products');
//   const optimizedUrl = optimizeUrl(uploadedImage.public_id);
//   const autoCroppedUrl = autoCropUrl(uploadedImage.public_id);
//   return { uploadedImage, optimizedUrl, autoCroppedUrl };
// };

// const handleBlogImgUpload = async (file) => {
//   const uploadedImage = await handleImageUpload(file, 'buyzone/blogs');
//   const optimizedUrl = optimizeUrl(uploadedImage.public_id);
//   const autoCroppedUrl = autoCropUrl(uploadedImage.public_id);
//   return { uploadedImage, optimizedUrl, autoCroppedUrl };
// };

module.exports = { handleProdImgUpload, handleBlogImgUpload };
