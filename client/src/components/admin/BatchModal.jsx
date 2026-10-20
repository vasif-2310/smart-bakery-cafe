import React, { useState } from 'react';
import { X, Boxes, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../common/Toast';

export const BatchModal = ({ isOpen, onClose, products = [], onBatchCreated }) => {
  const { showToast } = useToast();

  const generateBatchNumber = () => {
    const d = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(100 + Math.random() * 900);
    return `BATCH-${d}-${rand}`;
  };

  const getFutureDate = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  };

  const [productId, setProductId] = useState(products[0]?._id || '');
  const [batchNumber, setBatchNumber] = useState(generateBatchNumber());
  const [quantity, setQuantity] = useState(24);
  const [manufacturingDate, setManufacturingDate] = useState(new Date().toISOString().slice(0, 10));
  const [expiryDate, setExpiryDate] = useState(getFutureDate(4));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productId) {
      setErrorMessage('Please select a product for this batch.');
      return;
    }
    if (!quantity || Number(quantity) <= 0) {
      setErrorMessage('Batch quantity must be at least 1 unit.');
      return;
    }
    if (new Date(expiryDate) <= new Date(manufacturingDate)) {
      setErrorMessage('Expiry date must be after manufacturing date.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await api.post('/admin/inventory/batches', {
        productId,
        batchNumber,
        quantity: Number(quantity),
        manufacturingDate,
        expiryDate,
      });

      showToast(`Batch ${batchNumber} created! Inventory replenished by ${quantity} units.`, 'success');
      if (onBatchCreated) onBatchCreated(response.data.batch);
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to create inventory batch.';
      setErrorMessage(msg);
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: '#FFF',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
          padding: 0,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Boxes size={20} color="var(--accent-amber)" />
            <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-serif)', color: 'var(--primary-espresso)' }}>
              Add Freshness Batch (FEFO)
            </h3>
          </div>
          <button onClick={onClose} style={{ padding: '6px', borderRadius: '50%', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          {errorMessage && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                color: '#DC2626',
                fontSize: '0.85rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              Select Product *
            </label>
            <select
              className="input-field"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              required
            >
              <option value="">-- Choose Bakery Product --</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} ({p.category}) — Current Stock: {p.stockQuantity}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Batch Lot #
              </label>
              <input
                type="text"
                className="input-field"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Quantity Units *
              </label>
              <input
                type="number"
                className="input-field"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Baking Date
              </label>
              <input
                type="date"
                className="input-field"
                value={manufacturingDate}
                onChange={(e) => setManufacturingDate(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Expiry Date *
              </label>
              <input
                type="date"
                className="input-field"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                required
              />
            </div>
          </div>

          <p style={{ fontSize: '0.78rem', color: 'var(--text-light)', marginBottom: '1.25rem' }}>
            ℹ️ First-Expired-First-Out (FEFO) strategy: Customer checkouts will automatically deduct stock from this batch in chronological order of expiry.
          </p>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
            >
              {isSubmitting ? 'Replenishing...' : 'Create Batch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BatchModal;
