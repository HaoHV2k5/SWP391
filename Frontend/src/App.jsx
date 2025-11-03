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

// ===========================================
// COMPONENT IMPORTS
// ===========================================
import Navbar from "./components/homepageContainer/navigation/Navbar";
import Footer from "./components/homepageContainer/layout/Footer";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminPage from "./pages/AdminPage";
import StaffPage from "./pages/StaffPage";

// Member pages
import PostAd from "./pages/member/PostAd";
import MyPosts from "./pages/member/MyPosts";
import SavedPosts from "./pages/member/SavedPosts";
import MyOrders from "./pages/member/MyOrders";
import MemberContracts from "./pages/member/MemberContracts";
import AccountPage from "./pages/AccountPage";
import OTPVerificationPage from "./pages/OTPVerificationPage";
import KycPage from "./pages/kyc/KycPage";
import PaymentDashboard from "./components/seller/PaymentDashboard";
import PaymentReturnPage from "./pages/PaymentReturnPage";
import ReviewsAboutMePage from "./pages/reviews/ReviewsAboutMePage";
import MyReviewsPage from "./pages/reviews/MyReviewsPage";
import SellerReviewsPage from "./pages/reviews/SellerReviewsPage";
import ComplaintsAboutMePage from "./pages/complaints/ComplaintsAboutMePage";
import MyComplaintsPage from "./pages/complaints/MyComplaintsPage";

// Home pages
import CategoryRouter from "./components/homepageContainer/navigation/CategoryRouter";
import ProductDetailPage from "./pages/home/ProductDetailPage";
import TagPage from "./pages/home/TagPage";
import SearchResultsPage from "./pages/home/SearchResultsPage";

// Utils and services
import { normalizeLoginResponse, persistAuth, isStaff } from "./utils/auth";
import ProtectedStaffRoute from "./routes/ProtectedStaffRoute";
import ProtectedAdminRoute from "./routes/ProtectedAdminRoute";
import AppService from "./components/homepageContainer/navigation/AppService";
import "./App.css";
import PriceSuggestChat from "./components/ai/PriceSuggestChat";
import OrdersBought from "./pages/member/OrdersBought";

// ===========================================
// MAIN APP COMPONENT
// ===========================================
function AppContent() {
  // ===========================================
  // STATE MANAGEMENT
  // ===========================================
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // ===========================================
  // USER AUTHENTICATION & SESSION MANAGEMENT
  // ===========================================

  /**
   * Khôi phục user session từ localStorage khi app load
   * Xử lý cả Google OAuth callback và session thường
   */
  useEffect(() => {
    // Kiểm tra Google OAuth callback từ URL params
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const email = urlParams.get("email");
    const name = urlParams.get("name");

    if (token && email && name) {
      // Xử lý Google OAuth callback
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
      // Xoá query params khỏi URL
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    // Khôi phục session từ localStorage
    const userData = localStorage.getItem("userData");
    const storedToken = localStorage.getItem("token");
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        // Sync token nếu cần
        if (!storedToken && parsed.token) {
          localStorage.setItem("token", parsed.token);
        }
        setUser(parsed);
      } catch {
        // Xóa dữ liệu lỗi
        localStorage.removeItem("userData");
        localStorage.removeItem("token");
      }
    }
  }, []);

  // ===========================================
  // APP SERVICES INITIALIZATION
  // ===========================================

  /**
   * Khởi tạo các service cần thiết khi user thay đổi
   */
  useEffect(() => {
    AppService.initializeAppServices(user);
  }, [user]);

  // ===========================================
  // AUTHENTICATION HANDLERS
  // ===========================================

  // Xử lý khi user login thành công
  const handleLogin = (loginResponse) => {
    const normalized = normalizeLoginResponse(loginResponse);
    const userData = persistAuth(normalized);
    setUser(userData);

    // Khởi tạo các service sau khi login (bao gồm redirect logic)
    AppService.handleAppLogin(userData, navigate);
  };

  /**
   * Xử lý khi user logout
   */
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    AppService.handleAppLogout();
    toast.success("Đăng xuất thành công!");
    navigate("/", { replace: true });
  };

  // ===========================================
  // PAGE VISIBILITY LOGIC
  // ===========================================

  // Xác định các loại trang để ẩn/hiện Navbar/Footer
  const path = location.pathname;
  const isAuthPage =
    path === "/login" ||
    path === "/register" ||
    path === "/facebook-callback" ||
    path === "/verify-otp";

  const isStaffPage = path === "/staff";
  const isAdminPage = path.startsWith("/admin");

  // ===========================================
  // USER ROLE MANAGEMENT
  // ===========================================

  const currentRole = user?.user?.role || user?.role;
  const isStaffUser = user && isStaff(currentRole);
  const isAdminUser =
    user &&
    (currentRole === "ROLE_ADMIN" ||
      currentRole === "ADMIN" ||
      currentRole === "admin");

  /**
   * Auto-redirect staff user đến trang staff sau khi đăng nhập
   * Tránh redirect loop
   */
  useEffect(() => {
    if (isStaffUser && !isAuthPage && !isStaffPage && !isAdminPage) {
      toast.info("Chuyển hướng đến trang Staff...");
      const t = setTimeout(() => navigate("/staff", { replace: true }), 600);
      return () => clearTimeout(t);
    }
  }, [isStaffUser, isAuthPage, isStaffPage, isAdminPage, navigate]);

  /**
   * Tự động logout admin khi rời khỏi trang admin
   * Admin không nên có tài khoản trên homepage như user thường
   */
  useEffect(() => {
    if (isAdminUser && !isAdminPage && !isAuthPage) {
      console.log("🚫 Admin đang ở ngoài trang admin, logout...");
      handleLogout();
    }
  }, [isAdminUser, isAdminPage, isAuthPage]);

  // ===========================================
  // RENDER
  // ===========================================
  return (
    <div className="App">
      {/* NAVBAR - Ẩn trên trang auth, staff, admin */}
      {!isAuthPage && !isStaffPage && !isAdminPage && (
        <Navbar user={user} onLogout={handleLogout} />
      )}

      {/* MAIN ROUTES */}
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-otp" element={<OTPVerificationPage />} />

        {/* ADMIN ROUTES - Protected */}
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute user={user}>
              <AdminPage user={user} />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedAdminRoute user={user}>
              <AdminPage user={user} />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <ProtectedAdminRoute user={user}>
              <AdminPage user={user} />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/revenue"
          element={
            <ProtectedAdminRoute user={user}>
              <AdminPage user={user} />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/packages"
          element={
            <ProtectedAdminRoute user={user}>
              <AdminPage user={user} />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/kyc"
          element={
            <ProtectedAdminRoute user={user}>
              <AdminPage user={user} />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/complaints"
          element={
            <ProtectedAdminRoute user={user}>
              <AdminPage user={user} />
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/roles"
          element={
            <ProtectedAdminRoute user={user}>
              <AdminPage user={user} />
            </ProtectedAdminRoute>
          }
        />

        {/* STAFF ROUTES - Protected */}
        <Route
          path="/staff"
          element={
            <ProtectedStaffRoute user={user}>
              <StaffPage user={user} onLogout={handleLogout} />
            </ProtectedStaffRoute>
          }
        />

        {/* MEMBER ROUTES */}
        <Route path="/account" element={<AccountPage user={user} />} />
        <Route path="/kyc" element={<KycPage user={user} />} />
        <Route path="/payment" element={<PaymentDashboard user={user} />} />
        <Route path="/payment/return" element={<PaymentReturnPage />} />
        <Route path="/my-posts" element={<MyPosts user={user} />} />
        <Route path="/saved-posts" element={<SavedPosts user={user} />} />
        <Route path="/my-orders" element={<MyOrders user={user} />} />
        <Route path="/contracts" element={<MemberContracts user={user} />} />
        <Route path="/post-ad" element={<PostAd user={user} />} />
        <Route path="/ordered" element={<OrdersBought user={user} />} />
        <Route
          path="/reviews-about-me"
          element={<ReviewsAboutMePage user={user} />}
        />
        <Route path="/my-reviews" element={<MyReviewsPage user={user} />} />
        <Route
          path="/reviews/seller/:sellerId"
          element={<SellerReviewsPage user={user} />}
        />
        <Route
          path="/complaints-about-me"
          element={<ComplaintsAboutMePage user={user} />}
        />
        <Route
          path="/my-complaints"
          element={<MyComplaintsPage user={user} />}
        />

        {/* PRODUCT ROUTES */}
        <Route path="/products/:type" element={<CategoryRouter />} />
        <Route
          path="/product/:id"
          element={<ProductDetailPage user={user} />}
        />
        <Route path="/tag/:slug" element={<TagPage />} />

        {/* FALLBACK ROUTE */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* FOOTER - Ẩn trên trang auth, staff, admin */}
      {!isAuthPage && !isStaffPage && !isAdminPage && <Footer />}

      {/* TOAST NOTIFICATIONS */}
      <ToastContainer {...getToastDefaults()} theme="light" />
      {/* AI WIDGET - Chỉ hiển thị ở trang đăng tin */}
      {path === "/post-ad" && <PriceSuggestChat />}
    </div>
  );
}

// ===========================================
// ROUTER WRAPPER
// ===========================================
export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
