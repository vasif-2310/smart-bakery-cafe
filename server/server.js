const http = require('http');
const dotenv = require('dotenv');
const path = require('path');
const { Server } = require('socket.io');

// Load environment variables before importing app
dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = require('./config/db');
const app = require('./app');
const { initSocket } = require('./services/socketService');
const logger = require('./utils/logger');

// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 5000;
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

// Create HTTP Server & Attach Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [clientUrl, 'http://127.0.0.1:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST'],
  },
});

// Initialize Real-time Socket Event Handlers
initSocket(io);

// Start Server
server.listen(PORT, () => {
  logger.info(`=======================================================`);
  logger.info(` Smart Bakery & Café Server Running in [${process.env.NODE_ENV || 'development'}] mode`);
  logger.info(` REST API: http://localhost:${PORT}/api`);
  logger.info(` WebSocket Gateway: Active on port ${PORT}`);
  logger.info(`=======================================================`);
});

// Graceful Process Termination
const handleTermination = (signal) => {
  logger.info(`Received ${signal}. Shutting down HTTP server gracefully...`);
  server.close(() => {
    logger.info('HTTP server closed. Exiting process.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => handleTermination('SIGTERM'));
process.on('SIGINT', () => handleTermination('SIGINT'));
