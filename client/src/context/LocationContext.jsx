import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { calculateClientDistance } from '../utils/distanceCalculator';

const LocationContext = createContext();

// Default Store Location: Connaught Place, New Delhi (Fallback if backend settings unavailable)
const DEFAULT_STORE_LOCATION = {
  latitude: 28.6315,
  longitude: 77.2167,
  address: 'Block B, Connaught Place, New Delhi, Delhi 110001',
  name: 'Smart Bakery & Café - Central Flagship',
  maxRadiusKm: 5.0,
};

export const LocationProvider = ({ children }) => {
  const [storeLocation, setStoreLocation] = useState(DEFAULT_STORE_LOCATION);
  const [userLocation, setUserLocation] = useState(() => {
    try {
      const saved = localStorage.getItem('smart_bakery_user_location');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [distanceKm, setDistanceKm] = useState(null);
  const [isEligible, setIsEligible] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [eligibilityMessage, setEligibilityMessage] = useState('');
  const [deliveryFee, setDeliveryFee] = useState(40);

  // 1. Fetch live store delivery configuration from backend
  const fetchStoreSettings = useCallback(async () => {
    try {
      const response = await api.get('/delivery/settings');
      if (response.data && response.data.settings) {
        const s = response.data.settings;
        setStoreLocation({
          latitude: s.storeCoordinates?.lat || DEFAULT_STORE_LOCATION.latitude,
          longitude: s.storeCoordinates?.lng || DEFAULT_STORE_LOCATION.longitude,
          address: s.storeAddress || DEFAULT_STORE_LOCATION.address,
          name: s.storeName || DEFAULT_STORE_LOCATION.name,
          maxRadiusKm: s.maxDeliveryRadiusKm || 5.0,
        });
        if (s.deliveryBaseFee !== undefined) {
          setDeliveryFee(s.deliveryBaseFee);
        }
      }
    } catch (error) {
      console.warn('Could not fetch store settings, using standard defaults:', error);
    }
  }, []);

  useEffect(() => {
    fetchStoreSettings();
  }, [fetchStoreSettings]);

  // 2. Verify coordinates with Backend (Source of Truth)
  const verifyCoordinates = useCallback(
    async (lat, lng, addressLabel = '') => {
      if (!lat || !lng) return { isEligible: false, message: 'Invalid coordinates' };

      // Calculate instant client distance
      const clientDist = calculateClientDistance(
        storeLocation.latitude,
        storeLocation.longitude,
        Number(lat),
        Number(lng)
      );

      try {
        const response = await api.get(`/delivery/check?lat=${lat}&lng=${lng}`);
        const data = response.data;

        setDistanceKm(data.distanceKm);
        setIsEligible(data.isEligible);
        setEligibilityMessage(data.message);
        if (data.deliveryFee !== undefined) setDeliveryFee(data.deliveryFee);

        const newLoc = {
          lat: Number(lat),
          lng: Number(lng),
          address: addressLabel || data.address || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
          distanceKm: data.distanceKm,
          isEligible: data.isEligible,
        };
        setUserLocation(newLoc);
        localStorage.setItem('smart_bakery_user_location', JSON.stringify(newLoc));

        return data;
      } catch (err) {
        // Fallback to client Haversine if backend check has network issue
        const eligible = clientDist <= storeLocation.maxRadiusKm;
        const msg = eligible
          ? `Within delivery zone (${clientDist} km). Fresh delivery guaranteed!`
          : `Distance (${clientDist} km) exceeds our strict 5.0 km fresh bake radius.`;

        setDistanceKm(clientDist);
        setIsEligible(eligible);
        setEligibilityMessage(msg);

        const fallbackLoc = {
          lat: Number(lat),
          lng: Number(lng),
          address: addressLabel || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
          distanceKm: clientDist,
          isEligible: eligible,
        };
        setUserLocation(fallbackLoc);
        localStorage.setItem('smart_bakery_user_location', JSON.stringify(fallbackLoc));

        return { isEligible: eligible, distanceKm: clientDist, message: msg };
      }
    },
    [storeLocation]
  );

  // 3. Detect GPS Location via HTML5 Geolocation
  const detectGPSLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const err = 'Geolocation is not supported by your browser.';
        setEligibilityMessage(err);
        return reject(new Error(err));
      }

      setIsDetecting(true);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          try {
            // Attempt reverse geocoding via OpenStreetMap Nominatim for human-readable street
            let addressName = '';
            try {
              const geoRes = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
                { headers: { 'Accept-Language': 'en' } }
              );
              if (geoRes.ok) {
                const geoData = await geoRes.json();
                addressName = geoData.display_name || '';
              }
            } catch {
              addressName = `Current Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
            }

            const checkResult = await verifyCoordinates(lat, lng, addressName);
            setIsDetecting(false);
            resolve(checkResult);
          } catch (error) {
            setIsDetecting(false);
            reject(error);
          }
        },
        (error) => {
          setIsDetecting(false);
          let message = 'Failed to retrieve GPS location.';
          if (error.code === error.PERMISSION_DENIED) {
            message = 'Location access was denied. Please select or enter your address manually.';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            message = 'GPS position unavailable. Please type your delivery coordinates.';
          } else if (error.code === error.TIMEOUT) {
            message = 'GPS detection timed out. Please try again.';
          }
          setEligibilityMessage(message);
          reject(new Error(message));
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
      );
    });
  }, [verifyCoordinates]);

  // 4. Manually set coordinates (e.g. from saved user addresses or preset locations)
  const setManualLocation = useCallback(
    (lat, lng, label = '') => {
      return verifyCoordinates(lat, lng, label);
    },
    [verifyCoordinates]
  );

  // 5. Clear stored location
  const clearLocation = useCallback(() => {
    setUserLocation(null);
    setDistanceKm(null);
    setIsEligible(null);
    setEligibilityMessage('');
    localStorage.removeItem('smart_bakery_user_location');
  }, []);

  return (
    <LocationContext.Provider
      value={{
        storeLocation,
        userLocation,
        distanceKm,
        isEligible,
        isDetecting,
        eligibilityMessage,
        deliveryFee,
        detectGPSLocation,
        verifyCoordinates,
        setManualLocation,
        clearLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

export default LocationContext;
