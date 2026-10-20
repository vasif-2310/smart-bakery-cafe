import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  MapPin,
  Compass,
  Phone,
  Mail,
  Plus,
  Trash2,
  CheckCircle,
  Package,
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { useToast } from '../components/common/Toast';
import { formatAddress } from '../utils/formatters';

export const ProfilePage = () => {
  const { user, updateProfile, addAddress, removeAddress } = useAuth();
  const { addToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Add Address Form State
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: 'Home',
    street: '',
    landmark: '',
    city: 'New Delhi',
    state: 'Delhi',
    postalCode: '110001',
    coordinates: {
      lat: 28.6328,
      lng: 77.2197,
    },
    isDefault: false,
  });
  const [detectingGps, setDetectingGps] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      await updateProfile({ name, phone });
      addToast('Profile updated successfully', 'success');
    } catch (err) {
      addToast(err.message || 'Could not update profile', 'error');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleGpsDetect = () => {
    if (!navigator.geolocation) {
      addToast('Geolocation is not supported by your browser', 'error');
      return;
    }

    setDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setNewAddress((prev) => ({
          ...prev,
          coordinates: {
            lat: Math.round(position.coords.latitude * 10000) / 10000,
            lng: Math.round(position.coords.longitude * 10000) / 10000,
          },
        }));
        addToast('GPS Coordinates detected successfully!', 'success');
        setDetectingGps(false);
      },
      (error) => {
        addToast(`GPS Error: ${error.message}. Please input your coordinates manually.`, 'error');
        setDetectingGps(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    if (!newAddress.street || !newAddress.city || !newAddress.postalCode) {
      addToast('Please fill out all required address fields', 'error');
      return;
    }

    try {
      await addAddress(newAddress);
      addToast('New delivery address saved', 'success');
      setShowAddressForm(false);
      setNewAddress({
        label: 'Home',
        street: '',
        landmark: '',
        city: 'New Delhi',
        state: 'Delhi',
        postalCode: '110001',
        coordinates: { lat: 28.6328, lng: 77.2197 },
        isDefault: false,
      });
    } catch (err) {
      addToast(err.message || 'Failed to save address', 'error');
    }
  };

  return (
    <div style={{ padding: '2.5rem 0 5rem 0' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        {/* Page Title */}
        <div style={{ marginBottom: '2rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-amber)', textTransform: 'uppercase' }}>
            Account Settings
          </span>
          <h1 style={{ fontSize: '2.2rem', color: 'var(--primary-espresso)' }}>Your Customer Profile</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {/* Left Column: Personal Information Card */}
          <div
            style={{
              backgroundColor: '#FFF',
              borderRadius: '20px',
              border: '1px solid var(--border-subtle)',
              padding: '1.75rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <h2 style={{ fontSize: '1.3rem', color: 'var(--primary-espresso)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={20} color="var(--accent-amber)" /> Personal Details
            </h2>

            <form onSubmit={handleProfileSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address (Read-Only)</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="form-input"
                  style={{ backgroundColor: '#FAF6F0', color: '#78716C' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Mobile Phone</label>
                <input
                  type="tel"
                  value={phone}
                  placeholder="10-digit number"
                  onChange={(e) => setPhone(e.target.value)}
                  className="form-input"
                />
              </div>

              <button type="submit" disabled={updatingProfile} className="btn btn-primary btn-sm">
                {updatingProfile ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>

          {/* Right Column: Address Book */}
          <div
            style={{
              backgroundColor: '#FFF',
              borderRadius: '20px',
              border: '1px solid var(--border-subtle)',
              padding: '1.75rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.3rem', color: 'var(--primary-espresso)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={20} color="var(--accent-amber)" /> Saved Addresses
              </h2>
              <button
                type="button"
                onClick={() => setShowAddressForm(!showAddressForm)}
                className="btn btn-secondary btn-sm"
              >
                <Plus size={16} /> {showAddressForm ? 'Cancel' : 'Add New'}
              </button>
            </div>

            {/* Address Creation Form */}
            {showAddressForm && (
              <form
                onSubmit={handleAddressSubmit}
                style={{
                  backgroundColor: '#FAF6F0',
                  borderRadius: '14px',
                  padding: '1.25rem',
                  border: '1px solid var(--border-subtle)',
                  marginBottom: '1.5rem',
                }}
              >
                <h4 style={{ fontSize: '0.95rem', color: 'var(--primary-espresso)', marginBottom: '10px' }}>
                  New Delivery Location
                </h4>

                <div className="form-group">
                  <label className="form-label">Label (e.g. Home, Office)</label>
                  <input
                    type="text"
                    required
                    value={newAddress.label}
                    onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Street Address &amp; House/Flat No.</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Flat 402, Block B, Barakhamba Road"
                    value={newAddress.street}
                    onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      required
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Postal Code</label>
                    <input
                      type="text"
                      required
                      value={newAddress.postalCode}
                      onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                {/* GPS Coordinates & Detection */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label className="form-label">Coordinates (for 5km Delivery Check)</label>
                    <button
                      type="button"
                      onClick={handleGpsDetect}
                      disabled={detectingGps}
                      style={{
                        color: 'var(--accent-amber)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Compass size={13} /> {detectingGps ? 'Detecting...' : 'Detect GPS Coordinates'}
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <input
                      type="number"
                      step="any"
                      placeholder="Latitude"
                      value={newAddress.coordinates.lat}
                      onChange={(e) =>
                        setNewAddress({
                          ...newAddress,
                          coordinates: { ...newAddress.coordinates, lat: parseFloat(e.target.value) },
                        })
                      }
                      className="form-input"
                    />
                    <input
                      type="number"
                      step="any"
                      placeholder="Longitude"
                      value={newAddress.coordinates.lng}
                      onChange={(e) =>
                        setNewAddress({
                          ...newAddress,
                          coordinates: { ...newAddress.coordinates, lng: parseFloat(e.target.value) },
                        })
                      }
                      className="form-input"
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-sm">
                  Save Address
                </button>
              </form>
            )}

            {/* List of Saved Addresses */}
            {user?.addresses?.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                No delivery addresses saved yet. Add your home or office address to enable instant 5km delivery checkouts.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {user?.addresses?.map((addr) => (
                  <div
                    key={addr._id}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: addr.isDefault ? '#FEF3C7' : '#FAF6F0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary-espresso)' }}>
                          {addr.label}
                        </span>
                        {addr.isDefault && <span className="badge badge-gold" style={{ fontSize: '0.65rem' }}>Default</span>}
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {formatAddress(addr)}
                      </p>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-light)', display: 'block', marginTop: '4px' }}>
                        Coordinates: {addr.coordinates?.lat}, {addr.coordinates?.lng}
                      </span>
                    </div>

                    <button
                      onClick={() => removeAddress(addr._id)}
                      style={{ color: '#DC2626', padding: '4px' }}
                      title="Delete address"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
