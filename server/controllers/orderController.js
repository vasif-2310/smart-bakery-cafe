const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const BakerySettings = require('../models/BakerySettings');
const ApiResponse = require('../utils/apiResponse');
const { checkDeliveryEligibility } = require('../services/distanceService');
const { reserveStock, restoreStock } = require('../services/inventoryService');
const { generateQRCodeDataUrl, verifyPickupToken } = require('../services/qrService');
const { createGatewayOrder } = require('../services/paymentService');
const { emitOrderStatusUpdated, emitNewOrderPlaced } = require('../services/socketService');
const { ORDER_STATUS, ORDER_TYPES, PAYMENT_METHODS, PAYMENT_STATUS, ROLES } = require('../config/constants');

/**
 * Helper to generate order numbers: SBK-YYYYMMDD-XXXX
 */
const generateOrderNumber = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `SBK-${dateStr}-${randomSuffix}`;
};

/**
 * @desc    Process checkout and create a new order
 * @route   POST /api/orders
 * @access  Private (Customer)
 */
const createCheckoutOrder = async (req, res, next) => {
  try {
    const { orderType, items, deliveryAddress, paymentMethod, couponCode } = req.body;
    const settings = await BakerySettings.getSettings();

    // 1. Mandatory 5 KM Radius Validation for Delivery Orders
    let distanceKm = 0;
    if (orderType === ORDER_TYPES.DELIVERY) {
      if (!deliveryAddress || !deliveryAddress.coordinates) {
        return ApiResponse.error(res, 'Delivery address and GPS coordinates are required', 400);
      }
      const { lat, lng } = deliveryAddress.coordinates;
      const geoCheck = await checkDeliveryEligibility(lat, lng);

      if (!geoCheck.isEligible) {
        return ApiResponse.error(res, geoCheck.message, 400);
      }
      distanceKm = geoCheck.distanceKm;
    }

    // 2. Server-Side Price Calculation & Line Item Snapshot
    const orderItems = [];
    let calculatedSubtotal = 0;

    for (const requestedItem of items) {
      const product = await Product.findById(requestedItem.productId);
      if (!product) {
        return ApiResponse.error(res, `Product not found: ${requestedItem.productId}`, 404);
      }
      if (!product.isAvailable) {
        return ApiResponse.error(res, `'${product.name}' is currently unavailable for order`, 400);
      }

      // Compute customization deltas
      let unitPrice = product.price;
      const cust = requestedItem.customizations || {};

      if (cust.size && cust.size.priceDelta) {
        unitPrice += Number(cust.size.priceDelta);
      }
      if (Array.isArray(cust.beverageAddons)) {
        for (const addon of cust.beverageAddons) {
          if (addon.priceDelta) unitPrice += Number(addon.priceDelta);
        }
      }

      const itemSubtotal = unitPrice * requestedItem.quantity;
      calculatedSubtotal += itemSubtotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: requestedItem.quantity,
        customizations: cust,
        unitPrice,
        subtotal: itemSubtotal,
      });
    }

    // 3. Server-Side Coupon Discount Validation
    let discount = 0;
    let appliedCoupon = null;
    if (couponCode) {
      appliedCoupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      if (appliedCoupon) {
        const couponResult = appliedCoupon.calculateDiscount(calculatedSubtotal);
        if (couponResult.valid) {
          discount = couponResult.discount;
        } else {
          return ApiResponse.error(res, couponResult.message, 400);
        }
      }
    }

    // 4. Calculate Delivery Fee & Taxes
    let deliveryFee = 0;
    if (orderType === ORDER_TYPES.DELIVERY) {
      const threshold = settings.freeDeliveryThreshold || 500;
      deliveryFee = calculatedSubtotal >= threshold ? 0 : (settings.deliveryBaseFee || 40);
    }

    const taxRate = (settings.taxRatePercentage || 5) / 100;
    const tax = Math.round((calculatedSubtotal - discount) * taxRate);
    const finalTotal = Math.max(0, calculatedSubtotal - discount + deliveryFee + tax);

    // 5. Atomic Stock Reservation (Rolls back automatically on failure)
    await reserveStock(
      orderItems.map((i) => ({ productId: i.product, quantity: i.quantity }))
    );

    // 6. Generate Unique Order Number
    const orderNumber = generateOrderNumber();

    // 7. QR Code Generation for Pickup Orders
    let qrCodeData = null;
    if (orderType === ORDER_TYPES.PICKUP) {
      const qrGen = await generateQRCodeDataUrl('PENDING_CREATION', orderNumber);
      qrCodeData = qrGen.qrDataUrl;
    }

    // 8. Create Order Document in Database
    const order = await Order.create({
      orderNumber,
      customer: req.user._id,
      orderType,
      items: orderItems,
      subtotal: calculatedSubtotal,
      deliveryFee,
      tax,
      discount,
      couponCode: appliedCoupon ? appliedCoupon.code : undefined,
      totalAmount: finalTotal,
      deliveryAddress: orderType === ORDER_TYPES.DELIVERY ? { ...deliveryAddress, distanceKm } : undefined,
      paymentMethod,
      paymentStatus: paymentMethod === PAYMENT_METHODS.COD ? PAYMENT_STATUS.PENDING : PAYMENT_STATUS.PENDING,
      orderStatus: ORDER_STATUS.PENDING,
      qrCodeData,
      estimatedDeliveryTime: new Date(Date.now() + 45 * 60 * 1000), // ~45 min
    });

    // If pickup, re-sign QR code with actual order ID
    if (orderType === ORDER_TYPES.PICKUP) {
      const qrGen = await generateQRCodeDataUrl(order._id.toString(), order.orderNumber);
      order.qrCodeData = qrGen.qrDataUrl;
      await order.save();
    }

    // 9. Increment Coupon usage if applied
    if (appliedCoupon) {
      appliedCoupon.timesUsed += 1;
      await appliedCoupon.save();
    }

    // 10. Payment Gateway Initiation if Online Gateway / Razorpay / Card selected
    let paymentGatewayData = null;
    if (
      paymentMethod === PAYMENT_METHODS.ONLINE_GATEWAY ||
      paymentMethod === PAYMENT_METHODS.RAZORPAY_TEST ||
      paymentMethod === PAYMENT_METHODS.CARD_MOCK
    ) {
      paymentGatewayData = await createGatewayOrder(finalTotal, order.orderNumber);
    }

    // 11. Broadcast Real-Time Notification to Kitchen Display
    emitNewOrderPlaced(order);

    return ApiResponse.created(
      res,
      {
        order,
        paymentGateway: paymentGatewayData,
      },
      'Order placed successfully and sent to the kitchen'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get order by ID with authorization guard
 * @route   GET /api/orders/:id
 * @access  Private
 */
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('items.product', 'name imageUrl category preparationTime');

    if (!order) {
      return ApiResponse.error(res, 'Order not found', 404);
    }

    // Strict authorization guard: customer can only view their own order
    if (
      req.user.role === ROLES.CUSTOMER &&
      order.customer._id.toString() !== req.user._id.toString()
    ) {
      return ApiResponse.error(res, 'Access denied: You cannot view orders placed by other customers', 403);
    }

    return ApiResponse.success(res, { order }, 'Order retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get order history for currently logged-in customer
 * @route   GET /api/orders/my-orders
 * @access  Private (Customer)
 */
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .sort({ createdAt: -1 })
      .populate('items.product', 'name imageUrl category');

    return ApiResponse.success(res, { orders }, 'Customer orders retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify customer QR Code for counter pickup orders
 * @route   POST /api/orders/verify-pickup
 * @access  Private (Admin / Staff)
 */
const verifyPickupQR = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      return ApiResponse.error(res, 'Scanned QR token is required', 400);
    }

    const verification = verifyPickupToken(token);
    if (!verification.valid) {
      return ApiResponse.error(res, verification.message, 400);
    }

    const order = await Order.findById(verification.orderId);
    if (!order) {
      return ApiResponse.error(res, 'Matching order not found', 404);
    }

    if (order.qrCodeVerified) {
      return ApiResponse.error(res, 'This QR code has already been verified and the order picked up!', 400);
    }

    order.qrCodeVerified = true;
    order.orderStatus = ORDER_STATUS.DELIVERED;
    if (order.paymentStatus !== PAYMENT_STATUS.PAID) {
      order.paymentStatus = PAYMENT_STATUS.PAID;
    }
    await order.save();

    emitOrderStatusUpdated(order);

    return ApiResponse.success(
      res,
      { order },
      `Pickup verified successfully for Order #${order.orderNumber}! Hand over parcel to customer.`
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel an order under valid business rules & restore stock
 * @route   PUT /api/orders/:id/cancel
 * @access  Private
 */
const cancelOrder = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return ApiResponse.error(res, 'Order not found', 404);
    }

    // Customer can only cancel before 'preparing'
    if (req.user.role === ROLES.CUSTOMER) {
      if (order.customer.toString() !== req.user._id.toString()) {
        return ApiResponse.error(res, 'Unauthorized to cancel this order', 403);
      }
      if (order.orderStatus !== ORDER_STATUS.PENDING && order.orderStatus !== ORDER_STATUS.CONFIRMED) {
        return ApiResponse.error(res, 'Order cannot be cancelled once preparation has begun', 400);
      }
    }

    order.orderStatus = ORDER_STATUS.CANCELLED;
    order.cancellationReason = reason || 'Cancelled by customer';
    await order.save();

    // Safely restore stock
    await restoreStock(order.items);

    emitOrderStatusUpdated(order);

    return ApiResponse.success(res, { order }, 'Order cancelled successfully and stock restored');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCheckoutOrder,
  getOrderById,
  getMyOrders,
  verifyPickupQR,
  cancelOrder,
};
