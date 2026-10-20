const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ROLES } = require('../config/constants');
const { generateMockToken } = require('./setup');

describe('Authentication & Role-Based Access Control (RBAC)', () => {
  const TEST_PASSWORD = 'BakeryPassword@123';
  const MOCK_USER_ID = '662000000000000000000001';

  describe('Password Hashing with Bcrypt', () => {
    it('should hash plain-text passwords and never match plain-text directly', async () => {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(TEST_PASSWORD, salt);

      expect(hashedPassword).not.toBe(TEST_PASSWORD);
      expect(hashedPassword.startsWith('$2a$') || hashedPassword.startsWith('$2b$')).toBe(true);
    });

    it('should successfully verify a matching password hash', async () => {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(TEST_PASSWORD, salt);

      const isMatch = await bcrypt.compare(TEST_PASSWORD, hashedPassword);
      expect(isMatch).toBe(true);
    });

    it('should reject an incorrect password against the hash', async () => {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(TEST_PASSWORD, salt);

      const isMatch = await bcrypt.compare('WrongPassword456', hashedPassword);
      expect(isMatch).toBe(false);
    });
  });

  describe('JWT Token Signature & Decryption', () => {
    it('should generate a valid signed JWT containing userId and role payload', () => {
      const token = generateMockToken(MOCK_USER_ID, ROLES.CUSTOMER);
      expect(typeof token).toBe('string');

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded.id).toBe(MOCK_USER_ID);
      expect(decoded.role).toBe(ROLES.CUSTOMER);
    });

    it('should correctly encode administrative roles', () => {
      const adminToken = generateMockToken(MOCK_USER_ID, ROLES.ADMIN);
      const decoded = jwt.verify(adminToken, process.env.JWT_SECRET);

      expect(decoded.role).toBe(ROLES.ADMIN);
    });

    it('should reject token tampered with wrong secret', () => {
      const token = generateMockToken(MOCK_USER_ID, ROLES.CUSTOMER);
      expect(() => {
        jwt.verify(token, 'invalid_fake_secret_key');
      }).toThrow();
    });
  });

  describe('Role Authorization Matrix', () => {
    it('should correctly distinguish between Customer, Admin, and Delivery Agent', () => {
      const roles = [ROLES.CUSTOMER, ROLES.ADMIN, ROLES.DELIVERY_AGENT];
      expect(roles).toContain('customer');
      expect(roles).toContain('admin');
      expect(roles).toContain('delivery_agent');
    });

    it('should block non-admin roles from accessing administrative permissions', () => {
      const customerRole = ROLES.CUSTOMER;
      const isAdminAllowed = (role) => role === ROLES.ADMIN;

      expect(isAdminAllowed(customerRole)).toBe(false);
      expect(isAdminAllowed(ROLES.DELIVERY_AGENT)).toBe(false);
      expect(isAdminAllowed(ROLES.ADMIN)).toBe(true);
    });
  });
});
