import React, { useState, useEffect, useRef } from 'react';
import {
  ChefHat,
  Clock,
  CheckCircle2,
  Package,
  Truck,
  QrCode,
  Volume2,
  VolumeX,
  Bell,
  Sparkles,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { useToast } from '../../components/common/Toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export const KitchenDashboardPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const { joinKitchenRoom, leaveKitchenRoom, onNewOrder, onOrderStatusUpdated } = useSocket();
  const { showToast } = useToast();
  const audioContextRef = useRef(null);

  // Synthesize kitchen chime using Web Audio API
  const playKitchenChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = audioContextRef.current || new AudioCtx();
      audioContextRef.current = ctx;

      const now = ctx.currentTime;
      // Tone 1 (High bell)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.6);

      // Tone 2 (Higher harmony)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.15); // A5
      gain2.gain.setValueAtTime(0.35, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.15);
      osc2.stop(now + 0.9);
    } catch {
      // Audio autoplay policy fallback
    }
  };

  const fetchActiveOrders = async () => {
    try {
      const response = await api.get('/admin/orders?limit=50');
      const all = response.data.orders || [];
      // Keep only active kitchen orders
      const active = all.filter((o) =>
        ['pending', 'confirmed', 'preparing', 'ready_for_dispatch'].includes(o.orderStatus)
      );
      setOrders(active);
    } catch {
      showToast('Failed to fetch kitchen orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveOrders();
    joinKitchenRoom();

    const unsubNew = onNewOrder((newOrder) => {
      setOrders((prev) => [newOrder, ...prev]);
      playKitchenChime();
      showToast(`🔔 New Order #${newOrder.orderNumber} sent to kitchen!`, 'info');
    });

    const unsubStatus = onOrderStatusUpdated((updated) => {
      setOrders((prev) => {
        // If completed or cancelled, remove from kitchen view
        if (['delivered', 'cancelled', 'out_for_delivery'].includes(updated.orderStatus)) {
          return prev.filter((o) => o._id !== updated._id);
        }
        return prev.map((o) => (o._id === updated._id ? { ...o, ...updated } : o));
      });
    });

    return () => {
      leaveKitchenRoom();
      if (unsubNew) unsubNew();
      if (unsubStatus) unsubStatus();
    };
  }, [joinKitchenRoom, leaveKitchenRoom, onNewOrder, onOrderStatusUpdated, showToast]);

  const handleUpdateStatus = async (orderId, nextStatus) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: nextStatus });
      setOrders((prev) =>
        prev
          .map((o) => (o._id === orderId ? { ...o, orderStatus: nextStatus } : o))
          .filter((o) => !['delivered', 'out_for_delivery'].includes(nextStatus))
      );
      showToast(`Order updated to: ${nextStatus.replace(/_/g, ' ').toUpperCase()}`, 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update order state', 'error');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Connecting to Kitchen Display System (KDS)..." />;
  }

  // Kanban Columns
  const pendingAndConfirmed = orders.filter((o) => o.orderStatus === 'pending' || o.orderStatus === 'confirmed');
  const preparingOrders = orders.filter((o) => o.orderStatus === 'preparing');
  const readyOrders = orders.filter((o) => o.orderStatus === 'ready_for_dispatch');

  const renderOrderCard = (order, nextAction, nextStatus) => {
    const elapsedMinutes = Math.round((Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60));
    const isPickup = order.orderType === 'pickup';

    return (
      <div
        key={order._id}
        className="card"
        style={{
          padding: '1.25rem',
          borderRadius: 'var(--radius-md)',
          backgroundColor: '#FFF',
          borderLeft: `5px solid ${
            elapsedMinutes > 30 ? '#DC2626' : elapsedMinutes > 15 ? '#D97706' : '#10B981'
          }`,
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        {/* Card Top */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <strong style={{ fontSize: '1.05rem', color: 'var(--primary-espresso)' }}>
              #{order.orderNumber}
            </strong>
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-light)' }}>
              Customer: {order.customer?.name || 'In-Store Guest'}
            </span>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: elapsedMinutes > 20 ? '#DC2626' : '#15803D',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Clock size={12} /> {elapsedMinutes}m ago
            </span>
            <span className="badge badge-gold" style={{ fontSize: '0.65rem', marginTop: '2px' }}>
              {isPickup ? '🛍️ STORE PICKUP' : '🛵 5KM DELIVERY'}
            </span>
          </div>
        </div>

        {/* Customized Line Items */}
        <div
          style={{
            backgroundColor: '#FAF7F2',
            padding: '10px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {order.items?.map((item, idx) => (
            <div key={idx} style={{ borderBottom: idx < order.items.length - 1 ? '1px dashed #E2D9CD' : 'none', paddingBottom: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: 'var(--primary-espresso)' }}>
                <span>
                  {item.quantity}x {item.name}
                </span>
                {item.customizations?.size && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-amber)' }}>
                    [{item.customizations.size.name}]
                  </span>
                )}
              </div>

              {/* Special Piped Message Alert */}
              {item.customizations?.cakeMessage && (
                <div
                  style={{
                    backgroundColor: '#FEF3C7',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    marginTop: '4px',
                    fontSize: '0.75rem',
                    color: '#92400E',
                    fontWeight: 600,
                  }}
                >
                  🎂 Pipe: "{item.customizations.cakeMessage}"
                </div>
              )}

              {/* Eggless Requirement */}
              {item.customizations?.cakeEggless && (
                <span style={{ fontSize: '0.72rem', color: '#16A34A', fontWeight: 600, display: 'block', marginTop: '2px' }}>
                  🌱 Eggless Prep
                </span>
              )}

              {/* Beverage Addons */}
              {item.customizations?.milkChoice && (
                <span style={{ fontSize: '0.72rem', color: '#0284C7', display: 'block' }}>
                  🥛 {item.customizations.milkChoice} • {item.customizations.sweetness || 'Regular'}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Action Button */}
        {nextAction && (
          <button
            onClick={() => handleUpdateStatus(order._id, nextStatus)}
            className="btn btn-primary btn-sm"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.82rem' }}
          >
            {nextAction} <ArrowRight size={14} />
          </button>
        )}
      </div>
    );
  };

  return (
    <div style={{ backgroundColor: '#1E120C', minHeight: '100vh', color: '#FFF', padding: '1.5rem' }}>
      {/* Header bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          paddingBottom: '1rem',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: '#0284C7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFF',
            }}
          >
            <ChefHat size={24} />
          </div>
          <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', margin: 0, color: '#FFF' }}>
              Kitchen Display System (KDS)
            </h1>
            <span style={{ fontSize: '0.78rem', color: '#38BDF8' }}>
              Real-Time Oven & Barista Kanban Queue
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (!soundEnabled) playKitchenChime();
            }}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(255,255,255,0.1)', color: '#FFF', borderColor: 'rgba(255,255,255,0.2)' }}
          >
            {soundEnabled ? <Volume2 size={16} color="#34D399" /> : <VolumeX size={16} color="#F87171" />}
            <span>Chime: {soundEnabled ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={fetchActiveOrders}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(255,255,255,0.1)', color: '#FFF', borderColor: 'rgba(255,255,255,0.2)' }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* 3-Column Kanban Board */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
          alignItems: 'start',
        }}
      >
        {/* Column 1: New & Confirmed */}
        <div style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 'var(--radius-lg)', padding: '1rem', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '2px solid var(--accent-gold)', paddingBottom: '8px' }}>
            <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--accent-gold)' }}>
              1. New & Confirmed ({pendingAndConfirmed.length})
            </span>
            <span style={{ fontSize: '0.75rem', color: '#D4C3B3' }}>Awaiting Oven</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {pendingAndConfirmed.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#8C7461', fontSize: '0.85rem', padding: '2rem 0' }}>
                All clear! No pending orders.
              </p>
            ) : (
              pendingAndConfirmed.map((ord) => renderOrderCard(ord, 'Start Baking / Brewing', 'preparing'))
            )}
          </div>
        </div>

        {/* Column 2: In the Oven */}
        <div style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 'var(--radius-lg)', padding: '1rem', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '2px solid #0284C7', paddingBottom: '8px' }}>
            <span style={{ fontWeight: 800, fontSize: '1rem', color: '#38BDF8' }}>
              2. In the Oven / Brewing ({preparingOrders.length})
            </span>
            <span style={{ fontSize: '0.75rem', color: '#D4C3B3' }}>Active Prep</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {preparingOrders.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#8C7461', fontSize: '0.85rem', padding: '2rem 0' }}>
                No bakes currently in the oven.
              </p>
            ) : (
              preparingOrders.map((ord) => renderOrderCard(ord, 'Mark Baked & Packed', 'ready_for_dispatch'))
            )}
          </div>
        </div>

        {/* Column 3: Ready for Dispatch / Pickup */}
        <div style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 'var(--radius-lg)', padding: '1rem', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '2px solid #10B981', paddingBottom: '8px' }}>
            <span style={{ fontWeight: 800, fontSize: '1rem', color: '#34D399' }}>
              3. Packed & Ready ({readyOrders.length})
            </span>
            <span style={{ fontSize: '0.75rem', color: '#D4C3B3' }}>Awaiting Courier / Guest</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {readyOrders.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#8C7461', fontSize: '0.85rem', padding: '2rem 0' }}>
                No orders waiting for handover.
              </p>
            ) : (
              readyOrders.map((ord) =>
                renderOrderCard(
                  ord,
                  ord.orderType === 'pickup' ? 'Hand to Counter Barista' : 'Hand to Courier',
                  ord.orderType === 'pickup' ? 'delivered' : 'out_for_delivery'
                )
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KitchenDashboardPage;
