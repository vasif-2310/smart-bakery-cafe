const Coupon = require('../models/Coupon');
const ApiResponse = require('../utils/apiResponse');

/**
 * @desc    Validate a coupon and compute real-time discount preview
 * @route   POST /api/coupons/apply
 * @access  Public
 */
const applyCoupon = async (req, res, next) => {
  try {
    const { code, subtotal } = req.body;
    if (!code) {
      return ApiResponse.error(res, 'Coupon code is required', 400);
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) {
      return ApiResponse.error(res, 'Invalid coupon code', 404);
    }

    const result = coupon.calculateDiscount(Number(subtotal) || 0);
    if (!result.valid) {
      return ApiResponse.error(res, result.message, 400);
    }

    return ApiResponse.success(res, result, 'Coupon applied successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all coupons (Admin)
 * @route   GET /api/coupons
 * @access  Private/Admin
 */
const getAllCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    return ApiResponse.success(res, { coupons }, 'Coupons retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new coupon code (Admin)
 * @route   POST /api/coupons
 * @access  Private/Admin
 */
const createCoupon = async (req, res, next) => {
  try {
    const { code, description, discountType, discountAmount, minOrderValue, maxDiscountAmount, expiryDate, usageLimit, applicableCategories } = req.body;

    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) {
      return ApiResponse.error(res, 'Coupon code already exists', 409);
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      description,
      discountType,
      discountAmount,
      minOrderValue: minOrderValue || 0,
      maxDiscountAmount,
      expiryDate,
      usageLimit: usageLimit || 500,
      applicableCategories: applicableCategories || [],
    });

    return ApiResponse.created(res, { coupon }, 'Coupon created successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete coupon (Admin)
 * @route   DELETE /api/coupons/:id
 * @access  Private/Admin
 */
const deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return ApiResponse.error(res, 'Coupon not found', 404);
    }
    return ApiResponse.success(res, null, 'Coupon deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyCoupon,
  getAllCoupons,
  createCoupon,
  deleteCoupon,
};
