import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LiveDataProvider, useLiveData } from './context/LiveDataContext';
import LiveInvoice from './pages/shared/LiveInvoice';
import LiveSubscription from './pages/shared/LiveSubscription';
import CreateSubscription from './pages/shared/CreateSubscription';
import LiveReports from './pages/shared/LiveReports';
import { AdminGuard, StaffGuard, CustomerGuard } from './components/guards/RouteGuards';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Admin Pages
import AdminDashboardPage from './pages/admin/DashboardPage';
import ProductsPage from './pages/admin/ProductsPage';
import ProductFormPage from './pages/admin/ProductFormPage';
import PlansPage from './pages/admin/PlansPage';
import QuotationTemplatesPage from './pages/admin/QuotationTemplatesPage';
import DiscountsPage from './pages/admin/DiscountsPage';
import TaxesPage from './pages/admin/TaxesPage';
import StaffPage from './pages/admin/StaffPage';
import AdminCustomersPage from './pages/admin/CustomersPage';
import AdminSubscriptionsPage from './pages/admin/SubscriptionsPage';
import AdminNewSubscriptionPage from './pages/admin/NewSubscriptionPage';
import AdminSubscriptionDetailPage from './pages/admin/SubscriptionDetailPage';
import AdminInvoicesPage from './pages/admin/InvoicesPage';
import AdminInvoiceDetailPage from './pages/admin/InvoiceDetailPage';
import AdminPaymentsPage from './pages/admin/PaymentsPage';
import AdminRecordPaymentPage from './pages/admin/RecordPaymentPage';
import AdminOverduePage from './pages/admin/OverduePage';
import AdminReportsPage from './pages/admin/ReportsPage';

// Staff Pages
import StaffDashboardPage from './pages/staff/DashboardPage';
import StaffCustomersPage from './pages/staff/CustomersPage';
import StaffSubscriptionsPage from './pages/staff/SubscriptionsPage';
import StaffNewSubscriptionPage from './pages/staff/NewSubscriptionPage';
import StaffSubscriptionDetailPage from './pages/staff/SubscriptionDetailPage';
import StaffInvoicesPage from './pages/staff/InvoicesPage';
import StaffInvoiceDetailPage from './pages/staff/InvoiceDetailPage';
import StaffPaymentsPage from './pages/staff/PaymentsPage';
import StaffRecordPaymentPage from './pages/staff/RecordPaymentPage';
import StaffOverduePage from './pages/staff/OverduePage';
import StaffReportsPage from './pages/staff/ReportsPage';

// Customer Portal Pages
import PortalHomePage from './pages/portal/PortalHomePage';
import MySubscriptionsPage from './pages/portal/MySubscriptionsPage';
import CustomerSubscriptionDetailPage from './pages/portal/SubscriptionDetailPage';
import MyInvoicesPage from './pages/portal/MyInvoicesPage';
import CustomerInvoiceDetailPage from './pages/portal/InvoiceDetailPage';
import OnlinePaymentPage from './pages/portal/OnlinePaymentPage';
import ProfilePage from './pages/portal/ProfilePage';
import PortalProductsPage from './pages/portal/ProductsPage';

function RootRedirect() {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role === 'ADMIN') return <Navigate to="/user/admin" replace />;
  if (user.role === 'STAFF') return <Navigate to="/user/staff" replace />;
  return <Navigate to="/user/portal" replace />;
}

function AppRoutes() {
  // Re-mount route content after the first live API load so legacy screens
  // read the fetched data instead of their initial empty compatibility arrays.
  const { version, loading, error, reload } = useLiveData();
  const { user, isLoading } = useAuth();
  if (isLoading || (user && (loading || (version === 0 && !error)))) return <p>Loading…</p>;
  if (user && error) return <div role="alert"><p>Unable to load application data: {error}</p><button onClick={() => void reload()}>Try again</button></div>;
  return (
      <Routes key={version}>
        {/* ── Root ────────────────────────────────────────── */}
        <Route path="/" element={<RootRedirect />} />

        {/* ── Public Auth Routes ───────────────────────────── */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* ── Admin Routes: .../user/admin/... ─────────────── */}
        <Route
          path="/user/admin"
          element={
            <AdminGuard>
              <LiveReports role="admin" dashboard />
            </AdminGuard>
          }
        />
        <Route
          path="/user/admin/products"
          element={
            <AdminGuard>
              <ProductsPage />
            </AdminGuard>
          }
        />
        <Route
          path="/user/admin/products/new"
          element={
            <AdminGuard>
              <ProductFormPage />
            </AdminGuard>
          }
        />
        <Route
          path="/user/admin/products/:id/edit"
          element={
            <AdminGuard>
              <ProductFormPage />
            </AdminGuard>
          }
        />
        <Route
          path="/user/admin/plans"
          element={
            <AdminGuard>
              <PlansPage />
            </AdminGuard>
          }
        />
        <Route
          path="/user/admin/quotation-templates"
          element={
            <AdminGuard>
              <QuotationTemplatesPage />
            </AdminGuard>
          }
        />
        <Route
          path="/user/admin/discounts"
          element={
            <AdminGuard>
              <DiscountsPage />
            </AdminGuard>
          }
        />
        <Route
          path="/user/admin/taxes"
          element={
            <AdminGuard>
              <TaxesPage />
            </AdminGuard>
          }
        />
        <Route
          path="/user/admin/staff"
          element={
            <AdminGuard>
              <StaffPage />
            </AdminGuard>
          }
        />
        <Route
          path="/user/admin/customers"
          element={
            <AdminGuard>
              <AdminCustomersPage />
            </AdminGuard>
          }
        />
        <Route
          path="/user/admin/subscriptions"
          element={
            <AdminGuard>
              <AdminSubscriptionsPage />
            </AdminGuard>
          }
        />
        <Route
          path="/user/admin/subscriptions/new"
          element={
            <AdminGuard>
              <CreateSubscription role="admin" />
            </AdminGuard>
          }
        />
        <Route
          path="/user/admin/subscriptions/:id"
          element={
            <AdminGuard>
              <LiveSubscription role="admin" />
            </AdminGuard>
          }
        />
        <Route
          path="/user/admin/invoices"
          element={
            <AdminGuard>
              <AdminInvoicesPage />
            </AdminGuard>
          }
        />
        <Route
          path="/user/admin/invoices/:id"
          element={
            <AdminGuard>
              <LiveInvoice role="admin" />
            </AdminGuard>
          }
        />
        <Route
          path="/user/admin/payments"
          element={
            <AdminGuard>
              <AdminPaymentsPage />
            </AdminGuard>
          }
        />
        <Route
          path="/user/admin/payments/record"
          element={
            <AdminGuard>
              <AdminRecordPaymentPage />
            </AdminGuard>
          }
        />
        <Route
          path="/user/admin/overdue"
          element={
            <AdminGuard>
              <AdminOverduePage />
            </AdminGuard>
          }
        />
        <Route
          path="/user/admin/reports"
          element={
            <AdminGuard>
              <LiveReports role="admin" />
            </AdminGuard>
          }
        />

        {/* ── Staff Routes: .../user/staff/... ─────────────── */}
        <Route
          path="/user/staff"
          element={
            <StaffGuard>
              <LiveReports role="staff" dashboard />
            </StaffGuard>
          }
        />
        <Route
          path="/user/staff/customers"
          element={
            <StaffGuard>
              <StaffCustomersPage />
            </StaffGuard>
          }
        />
        <Route
          path="/user/staff/subscriptions"
          element={
            <StaffGuard>
              <StaffSubscriptionsPage />
            </StaffGuard>
          }
        />
        <Route
          path="/user/staff/subscriptions/new"
          element={
            <StaffGuard>
              <CreateSubscription role="staff" />
            </StaffGuard>
          }
        />
        <Route
          path="/user/staff/subscriptions/:id"
          element={
            <StaffGuard>
              <LiveSubscription role="staff" />
            </StaffGuard>
          }
        />
        <Route
          path="/user/staff/invoices"
          element={
            <StaffGuard>
              <StaffInvoicesPage />
            </StaffGuard>
          }
        />
        <Route
          path="/user/staff/invoices/:id"
          element={
            <StaffGuard>
              <LiveInvoice role="staff" />
            </StaffGuard>
          }
        />
        <Route
          path="/user/staff/payments"
          element={
            <StaffGuard>
              <StaffPaymentsPage />
            </StaffGuard>
          }
        />
        <Route
          path="/user/staff/payments/record"
          element={
            <StaffGuard>
              <StaffRecordPaymentPage />
            </StaffGuard>
          }
        />
        <Route
          path="/user/staff/overdue"
          element={
            <StaffGuard>
              <StaffOverduePage />
            </StaffGuard>
          }
        />
        <Route
          path="/user/staff/reports"
          element={
            <StaffGuard>
              <LiveReports role="staff" />
            </StaffGuard>
          }
        />

        {/* ── Customer Portal Routes: .../user/... ─────────── */}
        <Route
          path="/user"
          element={<Navigate to="/user/portal" replace />}
        />
        <Route
          path="/user/portal"
          element={
            <CustomerGuard>
              <PortalHomePage />
            </CustomerGuard>
          }
        />
        <Route
          path="/user/portal/subscriptions"
          element={
            <CustomerGuard>
              <MySubscriptionsPage />
            </CustomerGuard>
          }
        />
        <Route path="/user/portal/products" element={<CustomerGuard><PortalProductsPage /></CustomerGuard>} />
        <Route
          path="/user/portal/subscriptions/:id"
          element={
            <CustomerGuard>
              <LiveSubscription role="portal" />
            </CustomerGuard>
          }
        />
        <Route
          path="/user/portal/invoices"
          element={
            <CustomerGuard>
              <MyInvoicesPage />
            </CustomerGuard>
          }
        />
        <Route
          path="/user/portal/invoices/:id"
          element={
            <CustomerGuard>
              <LiveInvoice role="portal" />
            </CustomerGuard>
          }
        />
        <Route
          path="/user/portal/payment"
          element={
            <CustomerGuard>
              <OnlinePaymentPage />
            </CustomerGuard>
          }
        />
        <Route
          path="/user/portal/profile"
          element={
            <CustomerGuard>
              <ProfilePage />
            </CustomerGuard>
          }
        />

        {/* Customer Portal route aliases directly under /user */}
        <Route
          path="/user/subscriptions"
          element={<Navigate to="/user/portal/subscriptions" replace />}
        />
        <Route
          path="/user/invoices"
          element={<Navigate to="/user/portal/invoices" replace />}
        />
        <Route
          path="/user/profile"
          element={<Navigate to="/user/portal/profile" replace />}
        />
        <Route
          path="/user/payment"
          element={<Navigate to="/user/portal/payment" replace />}
        />

        {/* ── Fallback ────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
  );
}

export default function App() {
  return <AuthProvider><LiveDataProvider><AppRoutes /></LiveDataProvider></AuthProvider>;
}
