import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check current session on application mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await api.get('/auth/me');
        if (response.data?.user) {
          setUser(response.data.user);
        }
      } catch (error) {
        // Not authenticated or expired session
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Register new customer
  const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data?.user) {
      setUser(response.data.user);
    }
    return response;
  };

  // Login existing user
  const login = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data?.user) {
      setUser(response.data.user);
    }
    return response;
  };

  // Logout user
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setUser(null);
    }
  };

  // Update profile details
  const updateProfile = async (data) => {
    const response = await api.put('/auth/profile', data);
    if (response.data?.user) {
      setUser(response.data.user);
    }
    return response;
  };

  // Add delivery address
  const addAddress = async (addressData) => {
    const response = await api.post('/auth/addresses', addressData);
    if (response.data?.addresses) {
      setUser((prev) => ({ ...prev, addresses: response.data.addresses }));
    }
    return response;
  };

  // Remove delivery address
  const removeAddress = async (addressId) => {
    const response = await api.delete(`/auth/addresses/${addressId}`);
    if (response.data?.addresses) {
      setUser((prev) => ({ ...prev, addresses: response.data.addresses }));
    }
    return response;
  };

  // Toggle favorite product
  const toggleFavorite = async (productId) => {
    const response = await api.post(`/auth/favorites/${productId}`);
    if (response.data?.favorites) {
      setUser((prev) => ({ ...prev, favorites: response.data.favorites }));
    }
    return response;
  };

  const isAdmin = user?.role === 'admin';
  const isDeliveryAgent = user?.role === 'delivery_agent';
  const isCustomer = user?.role === 'customer' || (!isAdmin && !isDeliveryAgent);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        updateProfile,
        addAddress,
        removeAddress,
        toggleFavorite,
        isAdmin,
        isDeliveryAgent,
        isCustomer,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
