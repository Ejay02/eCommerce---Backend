const fs = require('fs');
const multer = require('multer');
const path = require('path');

const createMulterConfig = (destination) => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const dir = path.join(__dirname, `../public/images/${destination}`);
      fs.mkdirSync(dir, { recursive: true }); // Ensure directory exists
      cb(null, dir);
    },
    filename: function (req, file, cb) {
      if (file) {
        cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
      } else {
        cb(null, false);
      }
    }
  });

  const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
      if (file.mimetype.startsWith('image')) {
        cb(null, true);
      } else {
        cb({ message: 'Unsupported file format' }, false);
      }
    },
    limits: { fileSize: 1024 * 1024 * 2 }
  });

  return upload;
};

const uploadProductPhoto = createMulterConfig('products');
const uploadBlogPhoto = createMulterConfig('blogs');

module.exports = {
  uploadBlogPhoto,
  uploadProductPhoto
};
