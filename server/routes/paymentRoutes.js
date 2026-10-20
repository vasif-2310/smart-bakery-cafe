const express = require('express');
const router = express.Router();
const { verifyPayment, getPaymentByOrderId, createPaymentQr } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// Public/Customer dynamic UPI QR Code generation
router.post('/create-qr', createPaymentQr);

// Customer payment signature verification
router.post('/verify', protect, verifyPayment);
router.get('/:orderId', protect, getPaymentByOrderId);

module.exports = router;

