const crypto = require('crypto');
const QRCode = require('qrcode');

const HMAC_SECRET = process.env.QR_HMAC_SECRET || 'secure_qr_pickup_verification_token_key_2026';

/**
 * Creates a cryptographically signed HMAC token for pickup order verification
 */
const generatePickupToken = (orderId, orderNumber) => {
  const timestamp = Date.now();
  const payload = `${orderId}:${orderNumber}:${timestamp}`;
  const signature = crypto.createHmac('sha256', HMAC_SECRET).update(payload).digest('hex');
  return Buffer.from(JSON.stringify({ orderId, orderNumber, timestamp, signature })).toString('base64');
};

/**
 * Generates a QR Code as a Data URL for client display
 */
const generateQRCodeDataUrl = async (orderId, orderNumber) => {
  const token = generatePickupToken(orderId, orderNumber);
  const qrDataUrl = await QRCode.toDataURL(token, {
    width: 300,
    margin: 2,
    color: {
      dark: '#2C1810', // Deep roasted espresso color
      light: '#FFFFFF',
    },
  });
  return { token, qrDataUrl };
};

/**
 * Verifies the validity and signature of a scanned QR pickup token
 */
const verifyPickupToken = (tokenString) => {
  try {
    const decoded = JSON.parse(Buffer.from(tokenString, 'base64').toString('utf8'));
    const { orderId, orderNumber, timestamp, signature } = decoded;

    const payload = `${orderId}:${orderNumber}:${timestamp}`;
    const expectedSignature = crypto.createHmac('sha256', HMAC_SECRET).update(payload).digest('hex');

    if (signature !== expectedSignature) {
      return { valid: false, message: 'Invalid QR token signature. Possible forgery detected.' };
    }

    return { valid: true, orderId, orderNumber };
  } catch (error) {
    return { valid: false, message: 'Malformed QR verification token' };
  }
};

/**
 * Generates an authentic UPI payment QR code as a base64 Data URL
 * Standard UPI URI: upi://pay?pa={upiId}&pn={payeeName}&am={amount}&cu=INR&tn={transactionNote}
 */
const generateUpiPaymentQRCode = async ({
  orderNumber = 'SBK-TEMP',
  amount = 0,
  upiId = 'smartbakery@upi',
  payeeName = 'Smart Bakery & Cafe',
}) => {
  const numericAmount = Number(amount) || 0;
  const formattedAmount = numericAmount.toFixed(2);
  const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${formattedAmount}&cu=INR&tn=${encodeURIComponent('Order ' + orderNumber)}`;

  const qrDataUrl = await QRCode.toDataURL(upiUrl, {
    width: 340,
    margin: 2,
    color: {
      dark: '#2C1810', // Brand espresso dark
      light: '#FFFFFF',
    },
    errorCorrectionLevel: 'M',
  });

  return {
    upiUrl,
    qrDataUrl,
    upiId,
    payeeName,
    amount: numericAmount,
    formattedAmount,
    orderNumber,
  };
};

module.exports = {
  generatePickupToken,
  generateQRCodeDataUrl,
  verifyPickupToken,
  generateUpiPaymentQRCode,
};

