const Order = require('../models/Order');
const Payment = require('../models/Payment');
const ApiResponse = require('../utils/apiResponse');
const { verifyPaymentSignature } = require('../services/paymentService');
const { emitOrderStatusUpdated } = require('../services/socketService');
const { PAYMENT_STATUS, ORDER_STATUS } = require('../config/constants');

/**
 * @desc    Verify payment signature and finalize order payment status
 * @route   POST /api/payments/verify
 * @access  Private (Customer)
 */
const verifyPayment = async (req, res, next) => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature, paymentMethodDetails } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return ApiResponse.error(res, 'Order not found', 404);
    }

    // Verify cryptographic signature on the backend
    const verification = verifyPaymentSignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    if (!verification.verified) {
      // Record failed payment attempt
      await Payment.create({
        order: order._id,
        customer: req.user._id,
        amount: order.totalAmount,
        provider: order.paymentMethod,
        transactionId: razorpayPaymentId,
        status: PAYMENT_STATUS.FAILED,
        failureReason: verification.message,
        rawResponse: paymentMethodDetails || undefined,
      });

      return ApiResponse.error(res, `Payment verification failed: ${verification.message}`, 400);
    }

    // Payment Verified Successfully: Create immutable payment record
    const payment = await Payment.create({
      order: order._id,
      customer: req.user._id,
      amount: order.totalAmount,
      currency: 'INR',
      provider: order.paymentMethod,
      transactionId: verification.transactionId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      rawResponse: paymentMethodDetails || undefined,
      status: PAYMENT_STATUS.PAID,
    });

    // Update Order state
    order.paymentStatus = PAYMENT_STATUS.PAID;
    if (order.orderStatus === ORDER_STATUS.PENDING) {
      order.orderStatus = ORDER_STATUS.CONFIRMED;
    }
    await order.save();

    // Broadcast real-time update
    emitOrderStatusUpdated(order);

    return ApiResponse.success(res, { order, payment }, 'Payment verified successfully and order confirmed');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get payment audit record for an order
 * @route   GET /api/payments/:orderId
 * @access  Private
 */
const getPaymentByOrderId = async (req, res, next) => {
  try {
    const payment = await Payment.findOne({ order: req.params.orderId });
    if (!payment) {
      return ApiResponse.error(res, 'Payment record not found for this order', 404);
    }
    return ApiResponse.success(res, { payment }, 'Payment record retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Generate dynamic UPI QR Code for payment
 * @route   POST /api/payments/create-qr
 * @access  Public / Customer
 */
const { generateUpiPaymentQRCode } = require('../services/qrService');

const createPaymentQr = async (req, res, next) => {
  try {
    const { amount, orderNumber, orderId } = req.body;
    let resolvedOrderNumber = orderNumber || `SBK-PAY-${Date.now().toString().slice(-6)}`;
    let resolvedAmount = Number(amount) || 0;

    if (orderId) {
      const order = await Order.findById(orderId);
      if (order) {
        resolvedOrderNumber = order.orderNumber;
        resolvedAmount = order.totalAmount;
      }
    }

    const qrResult = await generateUpiPaymentQRCode({
      orderNumber: resolvedOrderNumber,
      amount: resolvedAmount,
    });

    return ApiResponse.success(res, qrResult, 'UPI Payment QR generated successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  verifyPayment,
  getPaymentByOrderId,
  createPaymentQr,
};

