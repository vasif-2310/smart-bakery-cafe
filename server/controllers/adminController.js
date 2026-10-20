const Order = require('../models/Order');
const Product = require('../models/Product');
const InventoryBatch = require('../models/InventoryBatch');
const DeliveryAssignment = require('../models/DeliveryAssignment');
const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');
const { emitOrderStatusUpdated, emitDeliveryAssigned } = require('../services/socketService');
const { ORDER_STATUS, ROLES, PAYMENT_STATUS, INVENTORY_STATUS } = require('../config/constants');

/**
 * Valid order status transition state machine
 */
const VALID_TRANSITIONS = {
  [ORDER_STATUS.PENDING]: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.PREPARING, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.PREPARING]: [ORDER_STATUS.READY_FOR_DISPATCH, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.READY_FOR_DISPATCH]: [ORDER_STATUS.OUT_FOR_DELIVERY, ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.OUT_FOR_DELIVERY]: [ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.DELIVERED]: [],
  [ORDER_STATUS.CANCELLED]: [],
};

/**
 * @desc    Get all orders with filtering, searching, and pagination (Admin/Kitchen)
 * @route   GET /api/admin/orders
 * @access  Private/Admin
 */
const getAllOrders = async (req, res, next) => {
  try {
    const { status, search, startDate, endDate, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && Object.values(ORDER_STATUS).includes(status)) {
      query.orderStatus = status;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (search && search.trim()) {
      query.$or = [
        { orderNumber: { $regex: search.trim(), $options: 'i' } },
        { 'deliveryAddress.city': { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('customer', 'name email phone')
      .populate('deliveryAssignment')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    return ApiResponse.success(res, {
      orders,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update order status along the valid state machine
 * @route   PUT /api/admin/orders/:id/status
 * @access  Private/Admin
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return ApiResponse.error(res, 'Order not found', 404);
    }

    const allowedNext = VALID_TRANSITIONS[order.orderStatus] || [];
    if (!allowedNext.includes(status)) {
      return ApiResponse.error(
        res,
        `Invalid status transition from '${order.orderStatus}' to '${status}'. Permitted: [${allowedNext.join(', ')}]`,
        400
      );
    }

    order.orderStatus = status;
    if (status === ORDER_STATUS.DELIVERED && order.paymentStatus !== PAYMENT_STATUS.PAID) {
      order.paymentStatus = PAYMENT_STATUS.PAID;
    }

    await order.save();
    emitOrderStatusUpdated(order);

    return ApiResponse.success(res, { order }, `Order status successfully updated to ${status}`);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Assign delivery agent to an order
 * @route   POST /api/admin/orders/:id/assign-delivery
 * @access  Private/Admin
 */
const assignDeliveryAgent = async (req, res, next) => {
  try {
    const { agentId, notes } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return ApiResponse.error(res, 'Order not found', 404);
    }

    const agent = await User.findOne({ _id: agentId, role: ROLES.DELIVERY_AGENT });
    if (!agent) {
      return ApiResponse.error(res, 'Specified user is not a valid delivery agent', 400);
    }

    const assignment = await DeliveryAssignment.findOneAndUpdate(
      { order: order._id },
      {
        order: order._id,
        agent: agent._id,
        status: 'assigned',
        deliveryNotes: notes,
        assignedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    order.deliveryAssignment = assignment._id;
    await order.save();

    emitDeliveryAssigned(agent._id.toString(), {
      assignmentId: assignment._id,
      orderNumber: order.orderNumber,
      deliveryAddress: order.deliveryAddress,
    });

    return ApiResponse.success(res, { assignment, order }, 'Delivery agent successfully assigned');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all active delivery agents for courier assignment dropdown
 * @route   GET /api/admin/delivery-agents
 * @access  Private/Admin
 */
const getDeliveryAgents = async (req, res, next) => {
  try {
    const agents = await User.find({ role: ROLES.DELIVERY_AGENT }).select('name email phone');
    return ApiResponse.success(res, { agents }, 'Delivery agents retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get inventory batch statuses & low-stock products
 * @route   GET /api/admin/inventory
 * @access  Private/Admin
 */
const getInventoryOverview = async (req, res, next) => {
  try {
    const lowStockProducts = await Product.find({ stockQuantity: { $lt: 20 } }).select('name stockQuantity category price');
    const batches = await InventoryBatch.find()
      .populate('product', 'name category')
      .sort({ expiryDate: 1 });

    const totalBatches = batches.length;
    const expiredBatches = batches.filter((b) => b.status === INVENTORY_STATUS.EXPIRED).length;

    return ApiResponse.success(res, {
      lowStockProducts,
      batches,
      totalBatches,
      expiredBatches,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new inventory batch
 * @route   POST /api/admin/inventory/batches
 * @access  Private/Admin
 */
const createInventoryBatch = async (req, res, next) => {
  try {
    const { productId, batchNumber, quantity, manufacturingDate, expiryDate } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return ApiResponse.error(res, 'Product not found', 404);
    }

    const batch = await InventoryBatch.create({
      product: productId,
      batchNumber,
      quantity,
      remainingQuantity: quantity,
      manufacturingDate: manufacturingDate || new Date(),
      expiryDate,
    });

    // Also increment product overall stock quantity
    product.stockQuantity += Number(quantity);
    await product.save();

    return ApiResponse.created(res, { batch }, 'Inventory batch created and product stock replenished');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Compute real aggregated sales analytics
 * @route   GET /api/admin/analytics
 * @access  Private/Admin
 */
const getAnalytics = async (req, res, next) => {
  try {
    const totalOrders = await Order.countDocuments();
    const deliveredOrders = await Order.countDocuments({ orderStatus: ORDER_STATUS.DELIVERED });
    const cancelledOrders = await Order.countDocuments({ orderStatus: ORDER_STATUS.CANCELLED });

    // Total Revenue from Delivered / Paid orders
    const revenueAgg = await Order.aggregate([
      { $match: { orderStatus: { $ne: ORDER_STATUS.CANCELLED }, paymentStatus: PAYMENT_STATUS.PAID } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' }, avgOrderValue: { $avg: '$totalAmount' } } },
    ]);

    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;
    const avgOrderValue = Math.round(revenueAgg[0]?.avgOrderValue || 0);

    // Category-wise sales
    const categorySalesAgg = await Order.aggregate([
      { $match: { orderStatus: { $ne: ORDER_STATUS.CANCELLED } } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'prod',
        },
      },
      { $unwind: '$prod' },
      {
        $group: {
          _id: '$prod.category',
          totalRevenue: { $sum: '$items.subtotal' },
          totalUnitsSold: { $sum: '$items.quantity' },
        },
      },
    ]);

    // Bestselling items
    const bestsellingAgg = await Order.aggregate([
      { $match: { orderStatus: { $ne: ORDER_STATUS.CANCELLED } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.name',
          unitsSold: { $sum: '$items.quantity' },
          revenue: { $sum: '$items.subtotal' },
        },
      },
      { $sort: { unitsSold: -1 } },
      { $limit: 5 },
    ]);

    return ApiResponse.success(res, {
      totalOrders,
      deliveredOrders,
      cancelledOrders,
      cancellationRate: totalOrders > 0 ? `${((cancelledOrders / totalOrders) * 100).toFixed(1)}%` : '0%',
      totalRevenue,
      avgOrderValue,
      categorySales: categorySalesAgg,
      bestsellingProducts: bestsellingAgg,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Export downloadable CSV of sales report
 * @route   GET /api/admin/analytics/export-csv
 * @access  Private/Admin
 */
const exportSalesReportCSV = async (req, res, next) => {
  try {
    const orders = await Order.find({ orderStatus: { $ne: ORDER_STATUS.CANCELLED } })
      .populate('customer', 'name email phone')
      .sort({ createdAt: -1 });

    let csv = 'Order Number,Date,Customer Name,Customer Email,Order Type,Subtotal,Tax,Discount,Total Amount,Payment Method,Payment Status,Order Status\n';

    orders.forEach((o) => {
      const dateStr = o.createdAt.toISOString().slice(0, 10);
      const custName = o.customer ? `"${o.customer.name.replace(/"/g, '""')}"` : 'Guest';
      const custEmail = o.customer ? o.customer.email : 'N/A';
      csv += `${o.orderNumber},${dateStr},${custName},${custEmail},${o.orderType},${o.subtotal},${o.tax},${o.discount},${o.totalAmount},${o.paymentMethod},${o.paymentStatus},${o.orderStatus}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=sales-report-${Date.now()}.csv`);
    return res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllOrders,
  updateOrderStatus,
  assignDeliveryAgent,
  getDeliveryAgents,
  getInventoryOverview,
  createInventoryBatch,
  getAnalytics,
  exportSalesReportCSV,
};
