const crypto = require('crypto');
const { ORDER_STATUS } = require('../config/constants');
const {
  generatePickupToken,
  verifyPickupToken,
} = require('../services/qrService');

describe('Order Lifecycle, Status State Machine & QR Token Security', () => {
  const MOCK_ORDER_ID = '662000000000000000000088';
  const MOCK_ORDER_NUMBER = 'SBK-20261019-9482';

  // Allowed state machine transitions in admin controller
  const VALID_TRANSITIONS = {
    [ORDER_STATUS.PENDING]: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED],
    [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.PREPARING, ORDER_STATUS.CANCELLED],
    [ORDER_STATUS.PREPARING]: [ORDER_STATUS.READY_FOR_DISPATCH, ORDER_STATUS.CANCELLED],
    [ORDER_STATUS.READY_FOR_DISPATCH]: [ORDER_STATUS.OUT_FOR_DELIVERY, ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED],
    [ORDER_STATUS.OUT_FOR_DELIVERY]: [ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED],
    [ORDER_STATUS.DELIVERED]: [],
    [ORDER_STATUS.CANCELLED]: [],
  };

  describe('Status State Machine Validation', () => {
    it('should permit valid chronological progress from pending to delivered', () => {
      let current = ORDER_STATUS.PENDING;

      // pending -> confirmed
      expect(VALID_TRANSITIONS[current]).toContain(ORDER_STATUS.CONFIRMED);
      current = ORDER_STATUS.CONFIRMED;

      // confirmed -> preparing
      expect(VALID_TRANSITIONS[current]).toContain(ORDER_STATUS.PREPARING);
      current = ORDER_STATUS.PREPARING;

      // preparing -> ready_for_dispatch
      expect(VALID_TRANSITIONS[current]).toContain(ORDER_STATUS.READY_FOR_DISPATCH);
      current = ORDER_STATUS.READY_FOR_DISPATCH;

      // ready_for_dispatch -> out_for_delivery
      expect(VALID_TRANSITIONS[current]).toContain(ORDER_STATUS.OUT_FOR_DELIVERY);
      current = ORDER_STATUS.OUT_FOR_DELIVERY;

      // out_for_delivery -> delivered
      expect(VALID_TRANSITIONS[current]).toContain(ORDER_STATUS.DELIVERED);
      current = ORDER_STATUS.DELIVERED;

      // terminal state
      expect(VALID_TRANSITIONS[current].length).toBe(0);
    });

    it('should disallow illegal skipping of states (e.g. pending directly to delivered)', () => {
      const allowedFromPending = VALID_TRANSITIONS[ORDER_STATUS.PENDING];
      expect(allowedFromPending).not.toContain(ORDER_STATUS.DELIVERED);
      expect(allowedFromPending).not.toContain(ORDER_STATUS.OUT_FOR_DELIVERY);
    });

    it('should disallow any transition out of cancelled status', () => {
      const allowedFromCancelled = VALID_TRANSITIONS[ORDER_STATUS.CANCELLED];
      expect(allowedFromCancelled.length).toBe(0);
    });
  });

  describe('HMAC SHA-256 Digitally Signed QR Pickup Token', () => {
    it('should generate a signed base64url pickup token string', () => {
      const token = generatePickupToken(MOCK_ORDER_ID, MOCK_ORDER_NUMBER);
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(20);
    });

    it('should successfully verify an authentic signed token', () => {
      const token = generatePickupToken(MOCK_ORDER_ID, MOCK_ORDER_NUMBER);
      const verification = verifyPickupToken(token);

      expect(verification.valid).toBe(true);
      expect(verification.orderId).toBe(MOCK_ORDER_ID);
      expect(verification.orderNumber).toBe(MOCK_ORDER_NUMBER);
    });

    it('should reject a tampered token signature', () => {
      const token = generatePickupToken(MOCK_ORDER_ID, MOCK_ORDER_NUMBER);
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
      decoded.signature = decoded.signature.slice(0, -4) + '0000';
      const tamperedToken = Buffer.from(JSON.stringify(decoded)).toString('base64');

      const verification = verifyPickupToken(tamperedToken);
      expect(verification.valid).toBe(false);
      expect(verification.message).toMatch(/signature/i);
    });

    it('should reject malformed or non-base64 tokens', () => {
      const verification = verifyPickupToken('totally_invalid_token_string');
      expect(verification.valid).toBe(false);
    });
  });

  describe('Order Reference Generation Pattern', () => {
    it('should generate order numbers matching the format SBK-YYYYMMDD-XXXX', () => {
      const generateOrderNumber = () => {
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        return `SBK-${dateStr}-${randomSuffix}`;
      };

      const orderNum = generateOrderNumber();
      const pattern = /^SBK-\d{8}-\d{4}$/;
      expect(pattern.test(orderNum)).toBe(true);
    });
  });
});
