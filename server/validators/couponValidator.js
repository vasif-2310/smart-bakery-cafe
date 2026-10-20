const { body } = require('express-validator');

const createCouponValidator = [
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Coupon code is required')
    .isLength({ min: 3, max: 20 })
    .withMessage('Coupon code must be 3-20 characters long'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Coupon description is required'),
  body('discountType')
    .isIn(['percentage', 'fixed'])
    .withMessage("Discount type must be either 'percentage' or 'fixed'"),
  body('discountAmount')
    .isFloat({ min: 1 })
    .withMessage('Discount amount must be greater than zero'),
  body('expiryDate')
    .isISO8601()
    .withMessage('A valid future expiry date is required'),
];

const applyCouponValidator = [
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Coupon code is required'),
  body('subtotal')
    .isFloat({ min: 0 })
    .withMessage('Subtotal must be a positive number'),
];

module.exports = {
  createCouponValidator,
  applyCouponValidator,
};
