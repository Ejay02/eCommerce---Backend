const express = require('express');
const router = express.Router();
const { admin, authMiddleware } = require('../middlewares/authMiddleware');

const {
  createEnquiry,
  updateEnquiry,
  deleteEnquiry,
  getEnquiry,
  getEnquires
} = require('../controller/enquiryController');

router.post('/', authMiddleware, admin, createEnquiry);
router.put('/:id', authMiddleware, admin, updateEnquiry);
router.delete('/:id', authMiddleware, admin, deleteEnquiry);
router.get('/:id', getEnquiry);
router.get('/', getEnquires);

module.exports = router;
