import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { IoCheckmarkCircleOutline } from "react-icons/io5";
import { CartProvider } from "./context/CartContext";
import { isSessionExpired, clearSession } from "./services/authService";
import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import CategoryPage from "./pages/CategoryPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminUsers from "./pages/Admin/AdminUsers";
import AdminOrders from "./pages/Admin/AdminOrders";
import AdminProducts from "./pages/Admin/AdminProducts";
import AdminCategories from "./pages/Admin/AdminCategories";
import AdminSubcategories from "./pages/Admin/AdminSubcategories";
import AdminCoupons from "./pages/Admin/AdminCoupons";
import AdminReviews from "./pages/Admin/AdminReviews";
import AdminProfile from "./pages/Admin/AdminProfile";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import AddressPage from "./pages/AddressPage";
// import SessionExpiredModal from "./components/ui/SessionExpiredModal";

// Info & Footer Link Pages
import AboutPage from "./pages/info/AboutPage";
import FeaturesPage from "./pages/info/FeaturesPage";
import WorksPage from "./pages/info/WorksPage";
import CareerPage from "./pages/info/CareerPage";
import CustomerSupportPage from "./pages/info/CustomerSupportPage";
import DeliveryDetailsPage from "./pages/info/DeliveryDetailsPage";
import TermsPage from "./pages/info/TermsPage";
import PrivacyPage from "./pages/info/PrivacyPage";
import AccountPage from "./pages/info/AccountPage";
import ManageDeliveriesPage from "./pages/info/ManageDeliveriesPage";
import OrdersPage from "./pages/info/OrdersPage";
import PaymentsPage from "./pages/info/PaymentsPage";
import FreeEbooksPage from "./pages/info/FreeEbooksPage";
import DevTutorialPage from "./pages/info/DevTutorialPage";
import BlogPage from "./pages/info/BlogPage";
import YoutubePlaylistPage from "./pages/info/YoutubePlaylistPage";

function GlobalToast() {
  const [toast, setToast] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const customMessage =
      sessionStorage.getItem("appToastMessage") ||
      location.state?.toastMessage;

    const hasLoginToast =
      sessionStorage.getItem("loginSuccessToast") === "true" ||
      location.state?.loginToast === true;

    if (customMessage) {
      sessionStorage.removeItem("appToastMessage");
      setToast({
        message: customMessage,
        type: "success",
      });

      const timer = setTimeout(() => {
        setToast(null);
      }, 3500);

      return () => clearTimeout(timer);
    } else if (hasLoginToast) {
      sessionStorage.removeItem("loginSuccessToast");
      setToast({
        message: "Logged in successfully!",
        type: "success",
      });

      const timer = setTimeout(() => {
        setToast(null);
      }, 3500);

      return () => clearTimeout(timer);
    }
  }, [location]);

  if (!toast) return null;

  return (
    <div className={`global-toast global-toast--${toast.type}`}>
      <IoCheckmarkCircleOutline size={20} className="global-toast-icon" />
      <span className="global-toast-text">{toast.message}</span>
    </div>
  );
}

function AdminRoute({ children }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // No token at all → just redirect to login without "session expired" warning
  if (!token) {
    clearSession("logout");
    return <Navigate to="/login" replace />;
  }

  // Token exists but is expired → show session expired warning
  if (isSessionExpired()) {
    clearSession("expired");
    return <Navigate to="/login?expired=1" replace />;
  }

  if (user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  // No token at all → just redirect to login without "session expired" warning
  if (!token) {
    clearSession("logout");
    return <Navigate to="/login" replace />;
  }

  // Token exists but is expired → show session expired warning
  if (isSessionExpired()) {
    clearSession("expired");
    return <Navigate to="/login?expired=1" replace />;
  }

  return children;
}

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <GlobalToast />
        {/* <SessionExpiredModal /> */}
        <Routes>
          {/* Auth routes without Header and Footer */}
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Admin routes with authentication & session protection */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <AdminUsers />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <AdminRoute>
                <AdminOrders />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <AdminRoute>
                <AdminProducts />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <AdminRoute>
                <AdminCategories />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/subcategories"
            element={
              <AdminRoute>
                <AdminSubcategories />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/coupons"
            element={
              <AdminRoute>
                <AdminCoupons />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/reviews"
            element={
              <AdminRoute>
                <AdminReviews />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/profile"
            element={
              <AdminRoute>
                <AdminProfile />
              </AdminRoute>
            }
          />

          {/* Main store routes with Header and Footer */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-address"
              element={
                <ProtectedRoute>
                  <AddressPage />
                </ProtectedRoute>
              }
            />

            {/* Footer & Information Link Routes */}
            {/* Company */}
            <Route path="/about" element={<AboutPage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/works" element={<WorksPage />} />
            <Route path="/career" element={<CareerPage />} />
            <Route path="/careers" element={<CareerPage />} />

            {/* Help */}
            <Route path="/customer-support" element={<CustomerSupportPage />} />
            <Route path="/support" element={<CustomerSupportPage />} />
            <Route path="/delivery-details" element={<DeliveryDetailsPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/terms-and-conditions" element={<TermsPage />} />
            <Route path="/privacy-policy" element={<PrivacyPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />

            {/* FAQ */}
            <Route path="/account" element={<AccountPage />} />
            <Route path="/manage-deliveries" element={<ManageDeliveriesPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/payments" element={<PaymentsPage />} />

            {/* Resources */}
            <Route path="/free-ebooks" element={<FreeEbooksPage />} />
            <Route path="/development-tutorial" element={<DevTutorialPage />} />
            <Route path="/tutorials" element={<DevTutorialPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/how-to-blog" element={<BlogPage />} />
            <Route path="/youtube-playlist" element={<YoutubePlaylistPage />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
