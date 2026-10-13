import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import RoleGuard from './components/common/RoleGuard';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import ForgotPasswordPage from './pages/public/ForgotPasswordPage';
import ResetPasswordPage from './pages/public/ResetPasswordPage';
import ResourceCatalogPage from './pages/public/ResourceCatalogPage';
import ResourceDetailPage from './pages/public/ResourceDetailPage';
import NotFoundPage from './pages/public/NotFoundPage';

// Customer Pages
import CustomerDashboardPage from './pages/customer/CustomerDashboardPage';
import CustomerBookingsPage from './pages/customer/CustomerBookingsPage';
import CustomerQueuePage from './pages/customer/CustomerQueuePage';
import CustomerPaymentsPage from './pages/customer/CustomerPaymentsPage';
import CustomerActivityPage from './pages/customer/CustomerActivityPage';
import CustomerNotificationsPage from './pages/customer/CustomerNotificationsPage';

// Provider Pages
import ProviderDashboardPage from './pages/provider/ProviderDashboardPage';
import ProviderResourcesPage from './pages/provider/ProviderResourcesPage';
import ResourceCreateEditPage from './pages/provider/ResourceCreateEditPage';
import ProviderBookingsQueuePage from './pages/provider/ProviderBookingsQueuePage';
import ProviderMaintenancePage from './pages/provider/ProviderMaintenancePage';
import ResourcePassportPage from './pages/provider/ResourcePassportPage';
import ProviderReportsPage from './pages/provider/ProviderReportsPage';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminResourcesPage from './pages/admin/AdminResourcesPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminBookingsQueuesPage from './pages/admin/AdminBookingsQueuesPage';
import AdminMaintenancePage from './pages/admin/AdminMaintenancePage';
import AdminNotificationsPage from './pages/admin/AdminNotificationsPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/resources" element={<ResourceCatalogPage />} />
          <Route path="/resources/:id" element={<ResourceDetailPage />} />

          {/* Customer Journey Routes (USER, OWNER, ADMIN can view customer surfaces) */}
          <Route
            path="/customer/dashboard"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['USER', 'OWNER', 'ADMIN']}>
                  <CustomerDashboardPage />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/bookings"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['USER', 'OWNER', 'ADMIN']}>
                  <CustomerBookingsPage />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/queue"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['USER', 'OWNER', 'ADMIN']}>
                  <CustomerQueuePage />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/payments"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['USER', 'OWNER', 'ADMIN']}>
                  <CustomerPaymentsPage />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/activity"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['USER', 'OWNER', 'ADMIN']}>
                  <CustomerActivityPage />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/notifications"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['USER', 'OWNER', 'ADMIN']}>
                  <CustomerNotificationsPage />
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          {/* Resource Provider Journey Routes (OWNER, ADMIN) */}
          <Route
            path="/provider/dashboard"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['OWNER', 'ADMIN']}>
                  <ProviderDashboardPage />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/provider/resources"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['OWNER', 'ADMIN']}>
                  <ProviderResourcesPage />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/provider/resources/new"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['OWNER', 'ADMIN']}>
                  <ResourceCreateEditPage />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/provider/resources/edit/:id"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['OWNER', 'ADMIN']}>
                  <ResourceCreateEditPage />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/provider/bookings"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['OWNER', 'ADMIN']}>
                  <ProviderBookingsQueuePage />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/provider/maintenance"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['OWNER', 'ADMIN']}>
                  <ProviderMaintenancePage />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/provider/passport/:id"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['OWNER', 'ADMIN']}>
                  <ResourcePassportPage />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/provider/reports"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['OWNER', 'ADMIN']}>
                  <ProviderReportsPage />
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          {/* Administrator Journey Routes (ADMIN only) */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['ADMIN']}>
                  <AdminDashboardPage />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/resources"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['ADMIN']}>
                  <AdminResourcesPage />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['ADMIN']}>
                  <AdminCategoriesPage />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/bookings"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['ADMIN']}>
                  <AdminBookingsQueuesPage />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/maintenance"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['ADMIN']}>
                  <AdminMaintenancePage />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/notifications"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['ADMIN']}>
                  <AdminNotificationsPage />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['ADMIN']}>
                  <AdminReportsPage />
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          {/* Catch-all 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;