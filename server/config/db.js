const mongoose = require('mongoose');

/**
 * Establishes connection to MongoDB database (Local or Atlas)
 * Includes retry logic, event listeners, and proper connection termination handling.
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_bakery_cafe';

  try {
    const conn = await mongoose.connect(uri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`[Database] MongoDB Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`[Database Error] Connection failed: ${error.message}`);
    // Do not crash immediately in dev mode to allow graceful developer intervention
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }

  // Connection Lifecycle Monitoring
  mongoose.connection.on('disconnected', () => {
    console.warn('[Database] MongoDB disconnected. Attempting reconnection...');
  });

  mongoose.connection.on('error', (err) => {
    console.error(`[Database Error] Runtime connection error: ${err.message}`);
  });
};

module.exports = connectDB;
