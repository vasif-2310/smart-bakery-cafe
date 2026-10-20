import React from 'react';
import { Coffee } from 'lucide-react';

export const LoadingSpinner = ({ message = 'Baking fresh goodness...' }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1rem',
        gap: '1rem',
        minHeight: '200px',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '56px',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            border: '3px solid #E8DDD0',
            borderTopColor: '#D97706',
            borderRadius: '50%',
            animation: 'spin 0.9s linear infinite',
          }}
        />
        <Coffee size={24} color="#D97706" />
      </div>
      <p style={{ color: '#78716C', fontWeight: 500, fontSize: '0.95rem' }}>{message}</p>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
