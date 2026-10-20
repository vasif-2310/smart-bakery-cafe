const express = require('express');
const router = express.Router();
const {
  applyCoupon,
  getAllCoupons,
  createCoupon,
  deleteCoupon,
} = require('../controllers/couponController');
const { protect, authorize } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { createCouponValidator, applyCouponValidator } = require('../validators/couponValidator');
const { ROLES } = require('../config/constants');

// Public checkout discount application
router.post('/apply', applyCouponValidator, validateRequest, applyCoupon);

// Admin-only coupon management
router.get('/', protect, authorize(ROLES.ADMIN), getAllCoupons);
router.post('/', protect, authorize(ROLES.ADMIN), createCouponValidator, validateRequest, createCoupon);
router.delete('/:id', protect, authorize(ROLES.ADMIN), deleteCoupon);

module.exports = router;
