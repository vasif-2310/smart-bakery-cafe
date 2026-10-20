const {
  calculateHaversineDistance,
  checkDeliveryEligibility,
} = require('../services/distanceService');

describe('Haversine Formula & 5.0 KM Delivery Geo-Fence Engine', () => {
  // Store Reference: Connaught Place, New Delhi
  const STORE_LAT = 28.6315;
  const STORE_LNG = 77.2167;

  describe('calculateHaversineDistance (Mathematical Unit Tests)', () => {
    it('should return 0.00 km when destination matches store coordinates exactly', () => {
      const distance = calculateHaversineDistance(STORE_LAT, STORE_LNG, STORE_LAT, STORE_LNG);
      expect(distance).toBe(0);
    });

    it('should accurately compute distance to Karol Bagh (~3.4 km)', () => {
      const karolBaghLat = 28.6514;
      const karolBaghLng = 77.1907;
      const distance = calculateHaversineDistance(STORE_LAT, STORE_LNG, karolBaghLat, karolBaghLng);

      expect(distance).toBeGreaterThan(3.0);
      expect(distance).toBeLessThan(4.0);
    });

    it('should accurately compute distance to India Gate (~2.4 km)', () => {
      const indiaGateLat = 28.6129;
      const indiaGateLng = 77.2295;
      const distance = calculateHaversineDistance(STORE_LAT, STORE_LNG, indiaGateLat, indiaGateLng);

      expect(distance).toBeGreaterThan(2.0);
      expect(distance).toBeLessThan(3.0);
    });

    it('should accurately compute distance to South Extension (~6.5 km)', () => {
      const southExtLat = 28.5728;
      const southExtLng = 77.2215;
      const distance = calculateHaversineDistance(STORE_LAT, STORE_LNG, southExtLat, southExtLng);

      expect(distance).toBeGreaterThan(6.0);
      expect(distance).toBeLessThan(7.5);
    });

    it('should accurately compute distance to Noida Sector 18 (> 12 km)', () => {
      const noidaLat = 28.5708;
      const noidaLng = 77.3271;
      const distance = calculateHaversineDistance(STORE_LAT, STORE_LNG, noidaLat, noidaLng);

      expect(distance).toBeGreaterThan(12.0);
    });
  });

  describe('5.0 KM Strict Radius Boundary Conditions', () => {
    it('should approve deliveries strictly within 5.0 km', () => {
      // Point approx 2.5 km away
      const customerLat = 28.6129;
      const customerLng = 77.2295;
      const dist = calculateHaversineDistance(STORE_LAT, STORE_LNG, customerLat, customerLng);

      expect(dist).toBeLessThanOrEqual(5.0);
    });

    it('should flag addresses beyond 5.0 km as ineligible for fresh bike dispatch', () => {
      // Point approx 6.6 km away
      const customerLat = 28.5728;
      const customerLng = 77.2215;
      const dist = calculateHaversineDistance(STORE_LAT, STORE_LNG, customerLat, customerLng);

      expect(dist).toBeGreaterThan(5.0);
    });
  });

  describe('checkDeliveryEligibility Input Validation', () => {
    it('should reject call with missing coordinates', async () => {
      await expect(checkDeliveryEligibility(undefined, 77.2167)).rejects.toThrow(
        'Valid latitude and longitude coordinates are required'
      );
      await expect(checkDeliveryEligibility(28.6315, undefined)).rejects.toThrow(
        'Valid latitude and longitude coordinates are required'
      );
    });

    it('should reject non-numeric inputs', async () => {
      await expect(checkDeliveryEligibility('invalid', 77.2167)).rejects.toThrow();
      await expect(checkDeliveryEligibility(28.6315, 'invalid')).rejects.toThrow();
    });
  });
});
