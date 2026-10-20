const BakerySettings = require('../models/BakerySettings');
const { DELIVERY_DEFAULTS } = require('../config/constants');

/**
 * Calculates straight-line distance between two geo-coordinates using the Haversine formula.
 * @param {number} lat1 Latitude of point 1 (in degrees)
 * @param {number} lon1 Longitude of point 1 (in degrees)
 * @param {number} lat2 Latitude of point 2 (in degrees)
 * @param {number} lon2 Longitude of point 2 (in degrees)
 * @returns {number} Distance in kilometers
 */
const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's mean radius in kilometers
  const toRad = (angle) => (angle * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  // Round to 2 decimal places
  return Math.round(distance * 100) / 100;
};

/**
 * Validates whether customer coordinates are within the bakery's 5.0 km delivery zone
 * @param {number} customerLat Customer latitude
 * @param {number} customerLng Customer longitude
 */
const checkDeliveryEligibility = async (customerLat, customerLng) => {
  if (
    customerLat === undefined ||
    customerLng === undefined ||
    isNaN(customerLat) ||
    isNaN(customerLng)
  ) {
    throw new Error('Valid latitude and longitude coordinates are required');
  }

  // Load configured store coordinates and delivery limits
  const settings = await BakerySettings.getSettings();
  const bakeryLat =
    settings.address?.coordinates?.lat ||
    Number(process.env.BAKERY_LAT) ||
    DELIVERY_DEFAULTS.BAKERY_LAT;
  const bakeryLng =
    settings.address?.coordinates?.lng ||
    Number(process.env.BAKERY_LNG) ||
    DELIVERY_DEFAULTS.BAKERY_LNG;
  const maxRadiusKm = settings.deliveryRadiusKm || DELIVERY_DEFAULTS.MAX_RADIUS_KM;

  const distanceKm = calculateHaversineDistance(bakeryLat, bakeryLng, customerLat, customerLng);
  const isEligible = distanceKm <= maxRadiusKm;

  return {
    isEligible,
    distanceKm,
    maxRadiusKm,
    bakeryCoordinates: {
      lat: bakeryLat,
      lng: bakeryLng,
    },
    message: isEligible
      ? `Great news! Your address is ${distanceKm} km away, comfortably within our ${maxRadiusKm} km fresh delivery radius.`
      : `Delivery unavailable: Your address is ${distanceKm} km away, which exceeds our maximum fresh delivery limit of ${maxRadiusKm} km. You can still place a Counter Pickup order!`,
  };
};

module.exports = {
  calculateHaversineDistance,
  checkDeliveryEligibility,
};
