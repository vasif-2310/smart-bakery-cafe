import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Croissant,
  ShoppingBag,
  Boxes,
  TicketPercent,
  BarChart3,
  ChefHat,
  Truck,
  ArrowLeft,
  Coffee,
} from 'lucide-react';

export const AdminSidebar = () => {
  const navItems = [
    { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/admin/orders', label: 'Orders & Dispatch', icon: ShoppingBag },
    { to: '/admin/products', label: 'Products & Menu', icon: Croissant },
    { to: '/admin/inventory', label: 'Inventory & FEFO', icon: Boxes },
    { to: '/admin/coupons', label: 'Coupons & Promos', icon: TicketPercent },
    { to: '/admin/analytics', label: 'Sales & Analytics', icon: BarChart3 },
  ];

  return (
    <aside
      style={{
        width: '260px',
        backgroundColor: '#1E100A',
        color: '#EAD9C8',
        minHeight: 'calc(100vh - var(--nav-height))',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '1.5rem 1rem',
        borderRight: '1px solid rgba(255,255,255,0.08)',
        flexShrink: 0,
      }}
      className="admin-sidebar"
    >
      <div>
        {/* Portal Brand */}
        <div style={{ padding: '0 0.75rem 1.5rem 0.75rem', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'var(--accent-amber)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFF',
              }}
            >
              <Coffee size={18} />
            </div>
            <div>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#FFF', display: 'block', letterSpacing: '-0.01em' }}>
                Admin Portal
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--accent-gold)' }}>
                Management Console
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  color: isActive ? '#FFF' : '#C7B299',
                  backgroundColor: isActive ? 'var(--accent-amber)' : 'transparent',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                })}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Live Operations Portals */}
        <div style={{ marginTop: '2rem', padding: '0 0.75rem' }}>
          <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8C7461', fontWeight: 700 }}>
            Live Operations
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
            <Link
              to="/kitchen"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(2, 132, 199, 0.15)',
                color: '#38BDF8',
                fontSize: '0.85rem',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              <ChefHat size={16} /> Kitchen KDS Display
            </Link>

            <Link
              to="/delivery"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#34D399',
                fontSize: '0.85rem',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              <Truck size={16} /> Courier Hub View
            </Link>
          </div>
        </div>
      </div>

      {/* Return to Customer Store */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#A8927E',
            fontSize: '0.85rem',
            padding: '8px 12px',
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={16} /> Customer Counter
        </Link>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .admin-sidebar {
            width: 100% !important;
            min-height: auto !important;
            flex-direction: row !important;
            flex-wrap: wrap !important;
            padding: 1rem !important;
          }
        }
      `}</style>
    </aside>
  );
};

export default AdminSidebar;
