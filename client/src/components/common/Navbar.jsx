import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  User as UserIcon,
  Menu as MenuIcon,
  X,
  Compass,
  Coffee,
  LogOut,
  LayoutDashboard,
  ChefHat,
  Truck,
  Package,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import useCart from '../../hooks/useCart';

export const Navbar = ({ openCartDrawer }) => {
  const { user, logout, isAdmin, isDeliveryAgent } = useAuth();
  const { itemCount: cartCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 900,
        backgroundColor: 'rgba(253, 251, 247, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border-subtle)',
        height: 'var(--nav-height)',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Brand Logo */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #D97706, #78350F)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFF',
              boxShadow: '0 4px 10px rgba(217, 119, 6, 0.3)',
            }}
          >
            <Coffee size={24} />
          </div>
          <div>
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.35rem',
                fontWeight: 800,
                color: 'var(--primary-espresso)',
                letterSpacing: '-0.02em',
                display: 'block',
                lineHeight: 1.1,
              }}
            >
              Smart Bakery <span style={{ color: 'var(--accent-gold)' }}>& Café</span>
            </span>
            <span style={{ fontSize: '0.72rem', color: '#854D0E', fontWeight: 600 }}>
              Artisanal Bakes • Fresh within 5km
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          style={{
            display: 'none',
            gap: '24px',
            alignItems: 'center',
          }}
          className="desktop-nav"
        >
          <Link
            to="/"
            style={{
              fontWeight: 600,
              fontSize: '0.95rem',
              color: isActive('/') ? 'var(--accent-amber)' : 'var(--text-main)',
            }}
          >
            Home
          </Link>
          <Link
            to="/menu"
            style={{
              fontWeight: 600,
              fontSize: '0.95rem',
              color: isActive('/menu') ? 'var(--accent-amber)' : 'var(--text-main)',
            }}
          >
            Catalogue & Menu
          </Link>
          <Link
            to="/menu?category=Bakery"
            style={{
              fontWeight: 500,
              fontSize: '0.9rem',
              color: 'var(--text-muted)',
            }}
          >
            Bakery
          </Link>
          <Link
            to="/menu?category=Non-Vegetarian"
            style={{
              fontWeight: 500,
              fontSize: '0.9rem',
              color: 'var(--text-muted)',
            }}
          >
            Savories
          </Link>
          <Link
            to="/menu?category=Cafe"
            style={{
              fontWeight: 500,
              fontSize: '0.9rem',
              color: 'var(--text-muted)',
            }}
          >
            Café
          </Link>
        </nav>

        {/* Right Navigation Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Favorites Link */}
          {user && (
            <Link
              to="/favorites"
              aria-label="Favorites"
              style={{
                position: 'relative',
                padding: '8px',
                borderRadius: '50%',
                display: 'flex',
                color: 'var(--text-main)',
              }}
            >
              <Heart size={22} />
              {user.favorites?.length > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    backgroundColor: '#E11D48',
                    color: '#FFF',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {user.favorites.length}
                </span>
              )}
            </Link>
          )}

          {/* Cart Trigger */}
          <button
            onClick={openCartDrawer || (() => navigate('/cart'))}
            aria-label="View Shopping Cart"
            style={{
              position: 'relative',
              padding: '8px',
              borderRadius: '50%',
              display: 'flex',
              color: 'var(--text-main)',
            }}
          >
            <ShoppingBag size={22} />
            {cartCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  backgroundColor: 'var(--accent-gold)',
                  color: '#FFF',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(217, 119, 6, 0.4)',
                }}
              >
                {cartCount}
              </span>
            )}
          </button>

          {/* User Account Menu / Login Button */}
          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: '#FFF',
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: '#FEF3C7',
                    color: '#B45309',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                  }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: 'var(--primary-espresso)',
                  }}
                  className="user-name-label"
                >
                  {user.name.split(' ')[0]}
                </span>
              </button>

              {/* Dropdown Menu */}
              {userDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '220px',
                    backgroundColor: '#FFF',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    boxShadow: 'var(--shadow-lg)',
                    padding: '8px 0',
                    zIndex: 1000,
                  }}
                >
                  <div style={{ padding: '8px 16px', borderBottom: '1px solid #F3ECE2' }}>
                    <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--primary-espresso)' }}>
                      {user.name}
                    </p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>{user.email}</p>
                    <span
                      className="badge badge-gold"
                      style={{ marginTop: '4px', fontSize: '0.65rem' }}
                    >
                      {user.role.toUpperCase()}
                    </span>
                  </div>

                  {isAdmin && (
                    <>
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 16px',
                          fontSize: '0.9rem',
                          color: 'var(--text-main)',
                        }}
                      >
                        <LayoutDashboard size={18} color="var(--accent-amber)" /> Admin Dashboard
                      </Link>
                      <Link
                        to="/kitchen"
                        onClick={() => setUserDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 16px',
                          fontSize: '0.9rem',
                          color: 'var(--text-main)',
                        }}
                      >
                        <ChefHat size={18} color="#0284C7" /> Kitchen Display
                      </Link>
                    </>
                  )}

                  {isDeliveryAgent && (
                    <Link
                      to="/delivery"
                      onClick={() => setUserDropdownOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 16px',
                        fontSize: '0.9rem',
                        color: 'var(--text-main)',
                      }}
                    >
                      <Truck size={18} color="#15803D" /> Delivery Dashboard
                    </Link>
                  )}

                  <Link
                    to="/orders"
                    onClick={() => setUserDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 16px',
                      fontSize: '0.9rem',
                      color: 'var(--text-main)',
                    }}
                  >
                    <Package size={18} color="var(--accent-amber)" /> My Orders & Tracking
                  </Link>

                  <Link
                    to="/profile"
                    onClick={() => setUserDropdownOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 16px',
                      fontSize: '0.9rem',
                      color: 'var(--text-main)',
                    }}
                  >
                    <UserIcon size={18} /> My Profile & Addresses
                  </Link>

                  <button
                    onClick={handleLogout}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      width: '100%',
                      padding: '10px 16px',
                      fontSize: '0.9rem',
                      color: '#DC2626',
                      borderTop: '1px solid #F3ECE2',
                      textAlign: 'left',
                    }}
                  >
                    <LogOut size={18} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Log In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-hamburger"
            aria-label="Toggle mobile menu"
            style={{
              padding: '6px',
              color: 'var(--primary-espresso)',
              display: 'flex',
            }}
          >
            {mobileMenuOpen ? <X size={26} /> : <MenuIcon size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'var(--nav-height)',
            left: 0,
            right: 0,
            backgroundColor: '#FFF',
            borderBottom: '2px solid var(--border-subtle)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <Link to="/" onClick={() => setMobileMenuOpen(false)} style={{ fontWeight: 600 }}>
            Home
          </Link>
          <Link to="/menu" onClick={() => setMobileMenuOpen(false)} style={{ fontWeight: 600 }}>
            Full Menu
          </Link>
          <Link to="/menu?category=Bakery" onClick={() => setMobileMenuOpen(false)}>
            Bakery Pastries & Cakes
          </Link>
          <Link to="/menu?category=Non-Vegetarian" onClick={() => setMobileMenuOpen(false)}>
            Non-Veg Savories
          </Link>
          <Link to="/menu?category=Cafe" onClick={() => setMobileMenuOpen(false)}>
            Café Brews & Shakes
          </Link>
          {user && (
            <>
              <Link to="/orders" onClick={() => setMobileMenuOpen(false)} style={{ fontWeight: 600 }}>
                My Orders & Tracking
              </Link>
              <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                My Profile & Addresses
              </Link>
            </>
          )}
        </div>
      )}

      <style>{`
        @media (min-width: 768px) {
          .desktop-nav { display: flex !important; }
          .mobile-hamburger { display: none !important; }
        }
        @media (max-width: 520px) {
          .user-name-label { display: none; }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
