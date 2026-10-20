const express = require('express');
const router = express.Router();
const {
  getAllOrders,
  updateOrderStatus,
  assignDeliveryAgent,
  getDeliveryAgents,
  getInventoryOverview,
  createInventoryBatch,
  getAnalytics,
  exportSalesReportCSV,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { updateOrderStatusValidator } = require('../validators/orderValidator');
const { ROLES } = require('../config/constants');

// All endpoints in adminRoutes require Admin authorization
router.use(protect, authorize(ROLES.ADMIN));

// Order Management
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatusValidator, validateRequest, updateOrderStatus);
router.post('/orders/:id/assign-delivery', assignDeliveryAgent);
router.get('/delivery-agents', getDeliveryAgents);

// Inventory & Batches
router.get('/inventory', getInventoryOverview);
router.post('/inventory/batches', createInventoryBatch);

// Analytics & Reports
router.get('/analytics', getAnalytics);
router.get('/analytics/export-csv', exportSalesReportCSV);

module.exports = router;
