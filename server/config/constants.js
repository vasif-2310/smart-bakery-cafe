/**
 * Application Constants and Enums
 * Central source of truth for business parameters, roles, and status workflows.
 */

const ROLES = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
  DELIVERY_AGENT: 'delivery_agent',
};

const CATEGORIES = {
  BAKERY: 'Bakery',
  NON_VEGETARIAN: 'Non-Vegetarian',
  CAFE: 'Cafe',
};

const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY_FOR_DISPATCH: 'ready_for_dispatch',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

const ORDER_TYPES = {
  DELIVERY: 'delivery',
  PICKUP: 'pickup',
};

const PAYMENT_METHODS = {
  COD: 'cod',
  CASH_ON_DELIVERY: 'cash_on_delivery',
  ONLINE_GATEWAY: 'online_gateway',
  RAZORPAY_TEST: 'razorpay_test',
  CARD_MOCK: 'card_mock',
};

const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

const INVENTORY_STATUS = {
  ACTIVE: 'active',
  DEPLETED: 'depleted',
  EXPIRED: 'expired',
};

const DELIVERY_DEFAULTS = {
  MAX_RADIUS_KM: 5.0,
  BASE_FEE: 40,
  FREE_DELIVERY_THRESHOLD: 500,
  TAX_RATE_PERCENTAGE: 5,
  // Default Bakery Coordinates: Connaught Place, New Delhi
  BAKERY_LAT: 28.6315,
  BAKERY_LNG: 77.2167,
};

module.exports = {
  ROLES,
  CATEGORIES,
  ORDER_STATUS,
  ORDER_TYPES,
  PAYMENT_METHODS,
  PAYMENT_STATUS,
  INVENTORY_STATUS,
  DELIVERY_DEFAULTS,
};
