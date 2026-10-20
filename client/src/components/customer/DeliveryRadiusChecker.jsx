import React, { useState } from 'react';
import { MapPin, Navigation, CheckCircle2, AlertTriangle, Compass, Info } from 'lucide-react';
import { useLocation } from '../../context/LocationContext';

export const DeliveryRadiusChecker = ({ compact = false, onEligibilityDetermined }) => {
  const {
    storeLocation,
    userLocation,
    distanceKm,
    isEligible,
    isDetecting,
    eligibilityMessage,
    detectGPSLocation,
    setManualLocation,
  } = useLocation();

  const [customLat, setCustomLat] = useState('');
  const [customLng, setCustomLng] = useState('');
  const [showManualInputs, setShowManualInputs] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Preset demo test locations around Central Delhi
  const PRESET_LOCATIONS = [
    { label: 'Connaught Place (Flagship)', lat: 28.6315, lng: 77.2167, expected: '0.0 km (Inside)' },
    { label: 'Karol Bagh Market', lat: 28.6514, lng: 77.1907, expected: '3.4 km (Inside)' },
    { label: 'India Gate / Lutyens', lat: 28.6129, lng: 77.2295, expected: '2.5 km (Inside)' },
    { label: 'South Extension', lat: 28.5728, lng: 77.2215, expected: '6.6 km (Outside 5km)' },
    { label: 'Noida Sec 18', lat: 28.5708, lng: 77.3271, expected: '13.1 km (Outside 5km)' },
  ];

  const handleDetectGPS = async () => {
    setErrorMsg('');
    try {
      const result = await detectGPSLocation();
      if (onEligibilityDetermined) onEligibilityDetermined(result);
    } catch (err) {
      setErrorMsg(err.message || 'Could not access GPS. Please choose a preset or enter manually.');
    }
  };

  const handleSelectPreset = async (preset) => {
    setErrorMsg('');
    try {
      const result = await setManualLocation(preset.lat, preset.lng, preset.label);
      if (onEligibilityDetermined) onEligibilityDetermined(result);
    } catch (err) {
      setErrorMsg(err.message || 'Location verification failed.');
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!customLat || !customLng) {
      setErrorMsg('Please enter both latitude and longitude coordinates.');
      return;
    }
    const lat = parseFloat(customLat);
    const lng = parseFloat(customLng);
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setErrorMsg('Please enter valid coordinates (-90 to 90 for Lat, -180 to 180 for Lng).');
      return;
    }

    setErrorMsg('');
    try {
      const result = await setManualLocation(lat, lng, `Custom Point (${lat}, ${lng})`);
      if (onEligibilityDetermined) onEligibilityDetermined(result);
    } catch (err) {
      setErrorMsg(err.message || 'Verification failed.');
    }
  };

  // Compute visual meter percentage (0 to 7 km scale)
  const meterPercentage = distanceKm !== null ? Math.min(100, Math.max(5, (distanceKm / 7.0) * 100)) : 0;
  const cutoffPercentage = (5.0 / 7.0) * 100; // ~71.4%

  if (compact) {
    return (
      <div
        style={{
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: isEligible === true ? '#ECFDF5' : isEligible === false ? '#FFFBEB' : '#F8FAFC',
          border: `1px solid ${isEligible === true ? '#A7F3D0' : isEligible === false ? '#FDE68A' : 'var(--border-subtle)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <MapPin
            size={20}
            color={isEligible === true ? '#059669' : isEligible === false ? '#D97706' : 'var(--accent-gold)'}
          />
          <div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary-espresso)' }}>
              {userLocation
                ? userLocation.address.length > 40
                  ? userLocation.address.substring(0, 40) + '...'
                  : userLocation.address
                : 'Delivery Zone Check (5.0 km max)'}
            </span>
            {distanceKm !== null && (
              <span
                style={{
                  marginLeft: '8px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: isEligible ? '#059669' : '#D97706',
                }}
              >
                ({distanceKm} km away)
              </span>
            )}
          </div>
        </div>

        <button
          onClick={handleDetectGPS}
          disabled={isDetecting}
          className="btn btn-secondary btn-sm"
          style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Navigation size={14} className={isDetecting ? 'animate-spin' : ''} />
          {isDetecting ? 'Locating...' : 'Use GPS'}
        </button>
      </div>
    );
  }

  return (
    <div
      className="card"
      style={{
        padding: '1.75rem',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        background: 'linear-gradient(180deg, #FFFFFF 0%, #FDFBF7 100%)',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-gold" style={{ fontSize: '0.72rem' }}>
              Freshness Geo-Fence
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
              5.0 km Straight-Line Radius
            </span>
          </div>
          <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-serif)', color: 'var(--primary-espresso)' }}>
            Check Delivery Eligibility
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            We hand-deliver within 5 km of our Connaught Place ovens to guarantee crisp croissants and hot beverages.
          </p>
        </div>

        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            backgroundColor: '#FEF3C7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Compass size={24} color="var(--accent-gold)" />
        </div>
      </div>

      {/* GPS Detection Action */}
      <div style={{ marginTop: '1.25rem', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        <button
          onClick={handleDetectGPS}
          disabled={isDetecting}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px' }}
        >
          <Navigation size={18} className={isDetecting ? 'animate-spin' : ''} />
          {isDetecting ? 'Detecting via GPS...' : 'Detect My Current Location'}
        </button>

        <button
          type="button"
          onClick={() => setShowManualInputs(!showManualInputs)}
          className="btn btn-secondary"
          style={{ padding: '10px 16px' }}
        >
          {showManualInputs ? 'Hide Custom Inputs' : 'Enter Lat/Lng Manually'}
        </button>
      </div>

      {errorMsg && (
        <div
          style={{
            marginTop: '1rem',
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            color: '#DC2626',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <AlertTriangle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Preset Location Quick Chips */}
      <div style={{ marginTop: '1.25rem' }}>
        <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-light)', marginBottom: '8px', textTransform: 'uppercase' }}>
          Test Quick Neighborhood Presets:
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {PRESET_LOCATIONS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              style={{
                fontSize: '0.8rem',
                padding: '6px 10px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-subtle)',
                backgroundColor: '#FFF',
                color: 'var(--text-main)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-gold)';
                e.currentTarget.style.backgroundColor = '#FFFBEB';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.backgroundColor = '#FFF';
              }}
            >
              📍 {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Manual Coordinates Form */}
      {showManualInputs && (
        <form onSubmit={handleManualSubmit} style={{ marginTop: '1.25rem', padding: '12px', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Latitude</label>
              <input
                type="number"
                step="any"
                className="input-field"
                placeholder="e.g. 28.6315"
                value={customLat}
                onChange={(e) => setCustomLat(e.target.value)}
                style={{ padding: '8px 12px', fontSize: '0.85rem' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Longitude</label>
              <input
                type="number"
                step="any"
                className="input-field"
                placeholder="e.g. 77.2167"
                value={customLng}
                onChange={(e) => setCustomLng(e.target.value)}
                style={{ padding: '8px 12px', fontSize: '0.85rem' }}
              />
            </div>
          </div>
          <button type="submit" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
            Calculate Straight-Line Distance
          </button>
        </form>
      )}

      {/* Result Status & Distance Gauge */}
      {distanceKm !== null && (
        <div
          style={{
            marginTop: '1.5rem',
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: isEligible ? '#F0FDF4' : '#FFFBEB',
            border: `1.5px solid ${isEligible ? '#86EFAC' : '#FCD34D'}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {isEligible ? (
                <CheckCircle2 size={24} color="#15803D" />
              ) : (
                <AlertTriangle size={24} color="#D97706" />
              )}
              <div>
                <span style={{ fontWeight: 700, fontSize: '1rem', color: isEligible ? '#15803D' : '#B45309' }}>
                  {isEligible ? 'Delivery Available to Your Location!' : 'Outside 5.0 km Delivery Boundary'}
                </span>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {userLocation?.address || 'Current coordinates verified'}
                </p>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: isEligible ? '#15803D' : '#D97706' }}>
                {distanceKm} km
              </span>
              <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-light)' }}>
                Straight-line
              </span>
            </div>
          </div>

          {/* Visual Boundary Meter */}
          <div style={{ margin: '14px 0 8px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-light)', marginBottom: '4px' }}>
              <span>0 km (Oven Counter)</span>
              <span style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>5.0 km Limit</span>
              <span>7+ km</span>
            </div>

            <div style={{ position: 'relative', height: '10px', backgroundColor: '#E2E8F0', borderRadius: '5px', overflow: 'hidden' }}>
              {/* Green Zone (0 to 5km) */}
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  width: `${cutoffPercentage}%`,
                  height: '100%',
                  backgroundColor: '#86EFAC',
                }}
              />
              {/* Red Zone (5km to 7km+) */}
              <div
                style={{
                  position: 'absolute',
                  left: `${cutoffPercentage}%`,
                  right: 0,
                  height: '100%',
                  backgroundColor: '#FECACA',
                }}
              />
              {/* User Position Pin Indicator */}
              <div
                style={{
                  position: 'absolute',
                  left: `${meterPercentage}%`,
                  top: 0,
                  bottom: 0,
                  width: '6px',
                  backgroundColor: isEligible ? '#15803D' : '#DC2626',
                  borderRadius: '2px',
                  transform: 'translateX(-50%)',
                  boxShadow: '0 0 6px rgba(0,0,0,0.4)',
                }}
              />
            </div>
          </div>

          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            {isEligible
              ? '✨ Fantastic! Your order will be baked fresh, packaged in thermal bakery wraps, and delivered within ~45 minutes.'
              : '💡 While delivery is unavailable past 5 km to keep textures crisp, you can select Store Pickup at checkout to grab your order hot from our Connaught Place café!'}
          </p>
        </div>
      )}
    </div>
  );
};

export default DeliveryRadiusChecker;
