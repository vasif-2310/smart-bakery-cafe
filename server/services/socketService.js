let io = null;
const logger = require('../utils/logger');

/**
 * Initializes the Socket.IO server with CORS options
 */
const initSocket = (socketIoInstance) => {
  io = socketIoInstance;

  io.on('connection', (socket) => {
    logger.debug(`Socket client connected: ${socket.id}`);

    // Customer joins their specific order room for live tracking
    socket.on('join_order', (orderId) => {
      socket.join(`order_${orderId}`);
      logger.debug(`Socket ${socket.id} joined room: order_${orderId}`);
    });

    // Kitchen staff joins the centralized kitchen dispatch channel
    socket.on('join_kitchen', () => {
      socket.join('kitchen_channel');
      logger.debug(`Socket ${socket.id} joined kitchen channel`);
    });

    // Delivery agents join their personal channel
    socket.on('join_delivery', (agentId) => {
      socket.join(`agent_${agentId}`);
      logger.debug(`Socket ${socket.id} joined agent channel: agent_${agentId}`);
    });

    socket.on('disconnect', () => {
      logger.debug(`Socket client disconnected: ${socket.id}`);
    });
  });
};

/**
 * Emits real-time order status updates to all interested rooms
 */
const emitOrderStatusUpdated = (order) => {
  if (!io) return;
  const orderId = order._id.toString();

  // 1. Notify specific customer viewing the order
  io.to(`order_${orderId}`).emit('order_status_updated', {
    orderId,
    orderNumber: order.orderNumber,
    orderStatus: order.orderStatus,
    updatedAt: order.updatedAt,
  });

  // 2. Notify kitchen dashboard
  io.to('kitchen_channel').emit('kitchen_order_updated', order);
};

/**
 * Emits notification of newly placed order to kitchen display
 */
const emitNewOrderPlaced = (order) => {
  if (!io) return;
  io.to('kitchen_channel').emit('new_order_placed', order);
};

/**
 * Emits delivery dispatch alert to assigned delivery agent
 */
const emitDeliveryAssigned = (agentId, assignmentData) => {
  if (!io) return;
  io.to(`agent_${agentId}`).emit('delivery_assigned', assignmentData);
};

module.exports = {
  initSocket,
  emitOrderStatusUpdated,
  emitNewOrderPlaced,
  emitDeliveryAssigned,
};
