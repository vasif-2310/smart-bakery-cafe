const express = require('express');
const router = express.Router();
const {
  checkEligibility,
  getDeliverySettings,
  updateDeliverySettings,
  getMyAssignments,
  updateAssignmentStatus,
} = require('../controllers/deliveryController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { ROLES } = require('../config/constants');

// Public geo-eligibility and store configuration
router.get('/check', checkEligibility);
router.get('/settings', getDeliverySettings);

// Admin-only delivery settings update
router.put('/settings', protect, authorize(ROLES.ADMIN), updateDeliverySettings);

// Delivery Agent fulfillment routes
router.get('/my-assignments', protect, authorize(ROLES.DELIVERY_AGENT), getMyAssignments);
router.put('/assignments/:id/status', protect, authorize(ROLES.DELIVERY_AGENT), updateAssignmentStatus);

module.exports = router;
