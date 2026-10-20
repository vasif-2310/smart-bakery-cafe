const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Ensure Test Environment Variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_smart_bakery_2026_xyz';
process.env.JWT_EXPIRE = '1d';
process.env.QR_HMAC_SECRET = process.env.QR_HMAC_SECRET || 'test_qr_hmac_secret_key_789';
process.env.PORT = '5001';

const TEST_MONGO_URI = process.env.MONGO_URI_TEST || 'mongodb://127.0.0.1:27017/smart_bakery_test';

/**
 * Connect to test database if not already connected
 */
const connectTestDB = async () => {
  if (mongoose.connection.readyState !== 0) return;
  try {
    await mongoose.connect(TEST_MONGO_URI, {
      serverSelectionTimeoutMS: 2000,
    });
  } catch (err) {
    // If local test mongodb is not running, log soft notice
    console.warn('Notice: Local MongoDB not connected for integration tests:', err.message);
  }
};

/**
 * Clean all collections in test database
 */
const clearTestDB = async () => {
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
};

/**
 * Close database connection
 */
const closeTestDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
};

/**
 * Generate mock signed JWT token for any user payload
 */
const generateMockToken = (userId, role = 'customer') => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
};

module.exports = {
  connectTestDB,
  clearTestDB,
  closeTestDB,
  generateMockToken,
};
