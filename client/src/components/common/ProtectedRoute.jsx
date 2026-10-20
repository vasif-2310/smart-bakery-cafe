import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner message="Checking authentication status..." />;
  }

  if (!isAuthenticated) {
    // Redirect to login while preserving previous attempted path
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check Role authorization if allowedRoles are specified
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <h2 style={{ color: '#DC2626', marginBottom: '1rem' }}>403 — Access Restricted</h2>
        <p style={{ marginBottom: '1.5rem' }}>
          Your current account role (<strong>{user?.role}</strong>) does not have permission to view this dashboard.
        </p>
        <Navigate to="/" replace />
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
