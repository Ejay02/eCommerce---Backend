const express = require('express');
const router = express.Router();

const { admin, authMiddleware } = require('../middlewares/authMiddleware');

const {
  createCoupon,
  getCoupons,
  updateCoupon,
  deleteCoupon,
  getCoupon
} = require('../controller/couponController');

router.post('/', authMiddleware, admin, createCoupon);
router.get('/', authMiddleware, admin, getCoupons);
router.put('/:id', authMiddleware, admin, updateCoupon);
router.delete('/:id', authMiddleware, admin, deleteCoupon);
router.get('/:id', authMiddleware, admin, getCoupon);

module.exports = router;
