import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import LoadingSpinner from './components/common/LoadingSpinner';
import ProtectedRoute from './components/common/ProtectedRoute';

// Lazy-loaded Pages for optimal bundling and fast initial paint
const HomePage = lazy(() => import('./pages/HomePage'));
const MenuPage = lazy(() => import('./pages/MenuPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const OrderTrackingPage = lazy(() => import('./pages/OrderTrackingPage'));
const OrdersHistoryPage = lazy(() => import('./pages/OrdersHistoryPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const PaymentGatewayPage = lazy(() => import('./pages/PaymentGatewayPage'));

// Admin, Kitchen & Delivery Portals
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminProductsPage = lazy(() => import('./pages/admin/AdminProductsPage'));
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrdersPage'));
const AdminInventoryPage = lazy(() => import('./pages/admin/AdminInventoryPage'));
const AdminCouponsPage = lazy(() => import('./pages/admin/AdminCouponsPage'));
const AdminAnalyticsPage = lazy(() => import('./pages/admin/AdminAnalyticsPage'));
const KitchenDashboardPage = lazy(() => import('./pages/kitchen/KitchenDashboardPage'));
const DeliveryDashboardPage = lazy(() => import('./pages/delivery/DeliveryDashboardPage'));

export function App() {
  return (
    <>
      <Navbar />
      <main className="main-content">
        <Suspense fallback={<LoadingSpinner message="Loading bakery fresh view..." />}>
          <Routes>
            {/* Public Customer Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/product/:identifier" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/payment" element={<PaymentGatewayPage />} />
            <Route path="/payment/:orderId" element={<PaymentGatewayPage />} />
            <Route path="/payment-gateway" element={<PaymentGatewayPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/order-tracking/:id" element={<OrderTrackingPage />} />

            {/* Protected Customer Routes */}
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <OrdersHistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/favorites"
              element={
                <ProtectedRoute>
                  <FavoritesPage />
                </ProtectedRoute>
              }
            />

            {/* Protected Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminProductsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminOrdersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/inventory"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminInventoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/coupons"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminCouponsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminAnalyticsPage />
                </ProtectedRoute>
              }
            />

            {/* Kitchen Real-Time Display */}
            <Route
              path="/kitchen"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <KitchenDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Delivery Agent Portal */}
            <Route
              path="/delivery"
              element={
                <ProtectedRoute allowedRoles={['delivery_agent', 'admin']}>
                  <DeliveryDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Catch-all 404 */}
            <Route
              path="*"
              element={
                <div className="container" style={{ padding: '5rem 1rem', textAlign: 'center' }}>
                  <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>404</h1>
                  <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
                    Oops! The pastry or page you were looking for seems to have been eaten.
                  </p>
                  <a href="/" className="btn btn-primary">
                    Return to Home Counter
                  </a>
                </div>
              }
            />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </>
  );
}

export default App;
