// src/App.jsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { getToastDefaults } from "./utils/notificationManager";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./components/homepageContainer/navigation/Navbar";
import Footer from "./components/homepageContainer/layout/Footer";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminPage from "./pages/AdminPage";
import StaffPage from "./pages/StaffPage";

import MemberOrders from "./pages/member/MemberOrders";
import PostAd from "./pages/member/PostAd";
import MyPosts from "./pages/member/MyPosts";
import SavedPosts from "./pages/member/SavedPosts";
import AccountPage from "./pages/AccountPage";
import OTPVerificationPage from "./pages/OTPVerificationPage";
import KycPage from "./pages/kyc/KycPage";
import "./App.css";
import CategoryRouter from "./components/homepageContainer/navigation/CategoryRouter";
import ProductDetailPage from "./pages/home/ProductDetailPage";
import TagPage from "./pages/home/TagPage";
import SearchResultsPage from "./pages/home/SearchResultsPage";
import { SavedProductsProvider } from "./components/homepageContainer/contexts/SavedProductsContext";
import { normalizeLoginResponse, persistAuth, isStaff } from "./utils/auth";
import ProtectedStaffRoute from "./routes/ProtectedStaffRoute";

function AppContent() {
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // --- Nhận token qua query (Google) hoặc khôi phục từ localStorage ---
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const email = urlParams.get("email");
    const name = urlParams.get("name");

    if (token && email && name) {
      const userData = {
        id: email,
        email,
        fullName: name,
        avatar: "",
        role: "member",
        token,
      };
      localStorage.setItem("token", token);
      localStorage.setItem("userData", JSON.stringify(userData));
      setUser(userData);
      setTimeout(
        () => toast.success(`Chào mừng ${name}! Đăng nhập Google thành công!`),
        100
      );
      // Xoá query trên URL
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    // Khôi phục từ localStorage
    const userData = localStorage.getItem("userData");
    const storedToken = localStorage.getItem("token");
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        if (!storedToken && parsed.token) {
          localStorage.setItem("token", parsed.token);
        }
        setUser(parsed);
      } catch {
        localStorage.removeItem("userData");
        localStorage.removeItem("token");
      }
    }
  }, []);

  const handleLogin = (loginResponse) => {
    const normalized = normalizeLoginResponse(loginResponse);
    const userData = persistAuth(normalized);
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    toast.success("Đăng xuất thành công!");
    navigate("/", { replace: true });
  };

  // --- Xác định bối cảnh trang để ẩn Navbar/Footer ---
  const path = location.pathname;
  const isAuthPage =
    path === "/login" ||
    path === "/register" ||
    path === "/facebook-callback" ||
    path === "/verify-otp";

  const isStaffPage = path === "/staff";
  const isAdminPage = path.startsWith("/admin");

  const currentRole = user?.user?.role || user?.role;
  const isStaffUser = user && isStaff(currentRole);

  // --- Auto-redirect staff sau khi đăng nhập (tránh loop) ---
  useEffect(() => {
    if (isStaffUser && !isAuthPage && !isStaffPage && !isAdminPage) {
      toast.info("Chuyển hướng đến trang Staff...");
      const t = setTimeout(() => navigate("/staff", { replace: true }), 600);
      return () => clearTimeout(t);
    }
  }, [isStaffUser, isAuthPage, isStaffPage, isAdminPage, navigate]);

  return (
    <div className="App">
      {/* Ẩn Navbar trên trang auth, staff, admin */}
      {!isAuthPage && !isStaffPage && !isAdminPage && (
        <Navbar user={user} onLogout={handleLogout} />
      )}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminPage user={user} />} />
        <Route path="/admin/users" element={<AdminPage user={user} />} />
        <Route path="/admin/products" element={<AdminPage user={user} />} />
        <Route path="/admin/kyc" element={<AdminPage user={user} />} />

        {/* Staff */}
        <Route
          path="/staff"
          element={
            <ProtectedStaffRoute user={user}>
              <StaffPage user={user} onLogout={handleLogout} />
            </ProtectedStaffRoute>
          }
        />

        {/* Member */}
        <Route path="/account" element={<AccountPage user={user} />} />
        <Route path="/kyc" element={<KycPage user={user} />} />
        <Route path="/my-posts" element={<MyPosts user={user} />} />
        <Route path="/saved-posts" element={<SavedPosts user={user} />} />
        <Route path="/orders" element={<MemberOrders user={user} />} />
        <Route path="/post-ad" element={<PostAd user={user} />} />

        {/* Fallback tránh “No routes matched …” */}
        <Route path="*" element={<Navigate to="/" replace />} />

        <Route path="/verify-otp" element={<OTPVerificationPage />} />
        <Route path="/products/:type" element={<CategoryRouter />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/tag/:slug" element={<TagPage />} />
      </Routes>

      {/* Ẩn Footer trên trang auth, staff, admin */}
      {!isAuthPage && !isStaffPage && !isAdminPage && <Footer />}

      <ToastContainer {...getToastDefaults()} theme="light" />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <SavedProductsProvider>
        <AppContent />
      </SavedProductsProvider>
    </Router>
  );
}
