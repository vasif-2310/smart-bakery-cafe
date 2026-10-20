import React from 'react';
import { QrCode, CheckCircle2, ShieldCheck, Printer, MapPin, Clock } from 'lucide-react';

export const QRPickupDisplay = ({ order }) => {
  if (!order) return null;

  const isPickup = order.orderType === 'pickup';
  const qrImage = order.qrCodeData;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="pickup-pass-card card"
      style={{
        borderRadius: 'var(--radius-lg)',
        border: '2px dashed var(--accent-gold)',
        backgroundColor: '#FFFDF9',
        padding: '2rem',
        maxWidth: '460px',
        margin: '0 auto',
        textAlign: 'center',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      {/* Pass Header */}
      <div
        style={{
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '1rem',
          marginBottom: '1.25rem',
        }}
      >
        <span
          className="badge badge-gold"
          style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}
        >
          Express Counter Collection
        </span>
        <h3
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.4rem',
            color: 'var(--primary-espresso)',
            marginTop: '8px',
          }}
        >
          Smart Bakery & Café
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Order Pass #{order.orderNumber}
        </p>
      </div>

      {/* QR Code Container */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          padding: '1.25rem',
          borderRadius: 'var(--radius-md)',
          display: 'inline-block',
          boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
          border: '1px solid #F1E9DB',
          marginBottom: '1rem',
        }}
      >
        {qrImage ? (
          <img
            src={qrImage}
            alt={`Pickup QR Code for ${order.orderNumber}`}
            style={{ width: '190px', height: '190px', display: 'block', margin: '0 auto' }}
          />
        ) : (
          <div
            style={{
              width: '190px',
              height: '190px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#F8FAFC',
              color: 'var(--text-muted)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <QrCode size={48} color="var(--accent-gold)" />
            <span style={{ fontSize: '0.8rem', marginTop: '8px' }}>Generating Pass...</span>
          </div>
        )}
      </div>

      {/* HMAC Verification Status */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          fontSize: '0.78rem',
          color: order.qrCodeVerified ? '#059669' : '#B45309',
          backgroundColor: order.qrCodeVerified ? '#ECFDF5' : '#FFFBEB',
          padding: '6px 12px',
          borderRadius: 'var(--radius-full)',
          width: 'fit-content',
          margin: '0 auto 1.25rem auto',
        }}
      >
        <ShieldCheck size={15} />
        <span style={{ fontWeight: 600 }}>
          {order.qrCodeVerified
            ? 'Verified by Counter Barista'
            : 'HMAC SHA-256 Digitally Signed'}
        </span>
      </div>

      {/* Pickup Location & Timings */}
      <div
        style={{
          backgroundColor: '#F7F2EA',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          textAlign: 'left',
          fontSize: '0.82rem',
          color: 'var(--text-main)',
          marginBottom: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <MapPin size={16} color="var(--accent-gold)" />
          <span style={{ fontWeight: 600 }}>Connaught Place Flagship Barista Counter</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
          <Clock size={16} />
          <span>Show this pass directly to the express counter staff.</span>
        </div>
      </div>

      {/* Items Summary in Pass */}
      <div
        style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '10px',
          marginBottom: '1.25rem',
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
        }}
      >
        <span>
          {order.items?.length || 0} item(s) • Total: ₹{order.totalAmount} •{' '}
          <strong style={{ color: 'var(--primary-espresso)' }}>
            {order.paymentStatus?.toUpperCase()}
          </strong>
        </span>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button
          onClick={handlePrint}
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Printer size={15} /> Print Pass
        </button>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .pickup-pass-card, .pickup-pass-card * {
            visibility: visible;
          }
          .pickup-pass-card {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: 2px solid #000;
            box-shadow: none;
          }
        }
      `}</style>
    </div>
  );
};

export default QRPickupDisplay;
