const BakerySettings = require('../models/BakerySettings');
const DeliveryAssignment = require('../models/DeliveryAssignment');
const Order = require('../models/Order');
const ApiResponse = require('../utils/apiResponse');
const { checkDeliveryEligibility } = require('../services/distanceService');
const { emitOrderStatusUpdated } = require('../services/socketService');
const { ORDER_STATUS, PAYMENT_STATUS } = require('../config/constants');

/**
 * @desc    Check customer coordinates for 5km delivery radius eligibility
 * @route   GET /api/delivery/check
 * @access  Public
 */
const checkEligibility = async (req, res, next) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      return ApiResponse.error(res, 'Latitude and longitude coordinates are required in query params', 400);
    }

    const result = await checkDeliveryEligibility(Number(lat), Number(lng));
    return ApiResponse.success(res, result, 'Delivery eligibility verified');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get bakery delivery rules and store operating configuration
 * @route   GET /api/delivery/settings
 * @access  Public
 */
const getDeliverySettings = async (req, res, next) => {
  try {
    const settings = await BakerySettings.getSettings();
    return ApiResponse.success(res, { settings }, 'Bakery delivery settings retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update delivery rules and coordinates (Admin)
 * @route   PUT /api/delivery/settings
 * @access  Private/Admin
 */
const updateDeliverySettings = async (req, res, next) => {
  try {
    let settings = await BakerySettings.findOne();
    if (!settings) {
      settings = new BakerySettings();
    }

    Object.assign(settings, req.body);
    await settings.save();

    return ApiResponse.success(res, { settings }, 'Bakery settings updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get deliveries assigned to the logged-in delivery agent
 * @route   GET /api/delivery/my-assignments
 * @access  Private (Delivery Agent)
 */
const getMyAssignments = async (req, res, next) => {
  try {
    const assignments = await DeliveryAssignment.find({ agent: req.user._id })
      .populate({
        path: 'order',
        populate: { path: 'items.product', select: 'name imageUrl' },
      })
      .sort({ assignedAt: -1 });

    return ApiResponse.success(res, { assignments }, 'Assigned deliveries retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update delivery status (Picked Up, Delivered with PIN)
 * @route   PUT /api/delivery/assignments/:id/status
 * @access  Private (Delivery Agent)
 */
const updateAssignmentStatus = async (req, res, next) => {
  try {
    const { status, confirmationPin, notes } = req.body;
    const assignment = await DeliveryAssignment.findById(req.params.id).populate('order');

    if (!assignment) {
      return ApiResponse.error(res, 'Delivery assignment not found', 404);
    }

    // Verify assignment belongs to logged in agent
    if (assignment.agent.toString() !== req.user._id.toString()) {
      return ApiResponse.error(res, 'Unauthorized to update this delivery assignment', 403);
    }

    const order = await Order.findById(assignment.order._id);

    if (status === 'picked_up') {
      assignment.status = 'picked_up';
      assignment.pickedUpAt = new Date();
      order.orderStatus = ORDER_STATUS.OUT_FOR_DELIVERY;
    } else if (status === 'delivered') {
      // Handshake PIN check
      if (confirmationPin && confirmationPin !== assignment.deliveryConfirmationPin) {
        return ApiResponse.error(res, 'Invalid customer delivery confirmation PIN', 400);
      }

      assignment.status = 'delivered';
      assignment.deliveredAt = new Date();
      order.orderStatus = ORDER_STATUS.DELIVERED;
      if (order.paymentStatus !== PAYMENT_STATUS.PAID) {
        order.paymentStatus = PAYMENT_STATUS.PAID; // Marked paid upon COD delivery
      }
    }

    if (notes) assignment.deliveryNotes = notes;

    await assignment.save();
    await order.save();

    emitOrderStatusUpdated(order);

    return ApiResponse.success(res, { assignment, order }, 'Delivery status updated');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkEligibility,
  getDeliverySettings,
  updateDeliverySettings,
  getMyAssignments,
  updateAssignmentStatus,
};
