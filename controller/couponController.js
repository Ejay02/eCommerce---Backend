const asyncHandler = require('express-async-handler');
const Coupon = require('../models/couponModel');
const cron = require('node-cron');
const validateMongoDbId = require('../utils/validateMongodbId');

const createCoupon = asyncHandler(async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.json(coupon);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error creating coupon: ' + error.message
    });
  }
});

const getCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const coupon = await Coupon.findById(id);
    res.json(coupon);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching coupon: ' + error.message
    });
  }
});

const getCoupons = asyncHandler(async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.json(coupons);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching coupons: ' + error.message
    });
  }
});

const updateCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const coupon = await Coupon.findByIdAndUpdate(id, req.body, { new: true });
    res.json(coupon);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error creating coupon: ' + error.message
    });
  }
});

const deleteCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const coupon = await Coupon.findByIdAndDelete(id, req.body, { new: true });
    res.json(coupon);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error creating coupon: ' + error.message
    });
  }
});

async function _deleteExpiredCoupons() {
  try {
    const expiredCoupons = await Coupon.find({ expiry: { $lt: new Date() } });

    if (expiredCoupons.length > 0) {
      const result = await Coupon.deleteMany({
        _id: { $in: expiredCoupons.map((coupon) => coupon._id) }
      });
      res.status(500).json({
        status: 'success',
        message: `Deleted ${result.deletedCount} expired coupons`
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error deleting expired coupons: ' + error.message
    });
  }
}

cron.schedule('*/2 * * * *', async () => {
  await _deleteExpiredCoupons();
});

module.exports = { createCoupon, getCoupons, updateCoupon, deleteCoupon, getCoupon };
