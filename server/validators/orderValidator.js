const { body } = require('express-validator');
const { ORDER_TYPES, PAYMENT_METHODS } = require('../config/constants');

const checkoutValidator = [
  body('orderType')
    .isIn(Object.values(ORDER_TYPES))
    .withMessage(`Order type must be either '${ORDER_TYPES.DELIVERY}' or '${ORDER_TYPES.PICKUP}'`),
  body('items')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item'),
  body('items.*.productId')
    .isMongoId()
    .withMessage('Each item must have a valid productId'),
  body('items.*.quantity')
    .isInt({ min: 1, max: 20 })
    .withMessage('Item quantity must be between 1 and 20'),
  body('paymentMethod')
    .isIn(Object.values(PAYMENT_METHODS))
    .withMessage(`Payment method must be one of: ${Object.values(PAYMENT_METHODS).join(', ')}`),
  // Conditional validation if orderType is delivery
  body('deliveryAddress.street')
    .if(body('orderType').equals(ORDER_TYPES.DELIVERY))
    .notEmpty()
    .withMessage('Street address is required for delivery orders'),
  body('deliveryAddress.city')
    .if(body('orderType').equals(ORDER_TYPES.DELIVERY))
    .notEmpty()
    .withMessage('City is required for delivery orders'),
  body('deliveryAddress.coordinates.lat')
    .if(body('orderType').equals(ORDER_TYPES.DELIVERY))
    .isFloat({ min: -90, max: 90 })
    .withMessage('Valid latitude is required for delivery eligibility check'),
  body('deliveryAddress.coordinates.lng')
    .if(body('orderType').equals(ORDER_TYPES.DELIVERY))
    .isFloat({ min: -180, max: 180 })
    .withMessage('Valid longitude is required for delivery eligibility check'),
];

const updateOrderStatusValidator = [
  body('status')
    .notEmpty()
    .withMessage('Order status is required'),
];

module.exports = {
  checkoutValidator,
  updateOrderStatusValidator,
};
