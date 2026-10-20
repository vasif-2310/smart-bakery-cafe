const express = require('express');
const router = express.Router();
const {
  createCheckoutOrder,
  getOrderById,
  getMyOrders,
  verifyPickupQR,
  cancelOrder,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { checkoutValidator } = require('../validators/orderValidator');
const { ROLES } = require('../config/constants');

// Customer checkout and personal orders
router.post('/', protect, checkoutValidator, validateRequest, createCheckoutOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/cancel', protect, cancelOrder);

// Staff QR Pickup scanning verification
router.post('/verify-pickup', protect, authorize(ROLES.ADMIN, ROLES.DELIVERY_AGENT), verifyPickupQR);

module.exports = router;
