// src/App.jsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { getToastDefaults } from "./utils/notificationManager";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminPage from "./pages/AdminPage";
import StaffPage from "./pages/StaffPage";
import MemberOrders from "./pages/member/MemberOrders";
import PostAd from "./pages/member/PostAd";
import MyPosts from "./pages/member/MyPosts";
import SavedPosts from "./pages/member/SavedPosts";
import ViewHistory from "./pages/member/ViewHistory";
import AccountPage from "./pages/AccountPage";
import OTPVerificationPage from "./pages/OTPVerificationPage";
import "./App.css";
import CategoryPage from "./components/homepageContainer/layout/CategoryPage";
import ProductDetailPage from "./components/homepageContainer/layout/ProductDetailPage";
import { SavedProductsProvider } from "./components/homepageContainer/contexts/SavedProductsContext";
import { normalizeLoginResponse, persistAuth, isStaff } from "./utils/auth";
import ProtectedStaffRoute from "./routes/ProtectedStaffRoute";

function AppContent() {
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

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
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    const checkUserData = () => {
      const userData = localStorage.getItem("userData");
      const token = localStorage.getItem("token");
      if (userData) {
        try {
          const parsed = JSON.parse(userData);
          if (!token && parsed.token)
            localStorage.setItem("token", parsed.token);
          setUser(parsed);
        } catch {
          localStorage.removeItem("userData");
          localStorage.removeItem("token");
        }
      }
    };
    checkUserData();
  }, []);

  const handleLogin = (loginResponse) => {
    // loginResponse chính là object bạn log ra (code:1000, data:{token, refreshToken, user...})
    const normalized = normalizeLoginResponse(loginResponse);
    const userData = persistAuth(normalized);
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    toast.success("Đăng xuất thành công!");
  };

  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";
  const isStaffPage = location.pathname === "/staff";
  const currentRole = user?.user?.role || user?.role;
  const isStaffUser = user && isStaff(currentRole);

  useEffect(() => {
    if (isStaffUser && !isAuthPage && !isStaffPage) {
      toast.info("Chuyển hướng đến trang Staff...");
      setTimeout(() => navigate("/staff", { replace: true }), 600);
    }
  }, [isStaffUser, isAuthPage, isStaffPage, navigate]);

  return (
    <div className="App">
      {!isAuthPage && !isStaffPage && (
        <Navbar user={user} onLogout={handleLogout} />
      )}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin" element={<AdminPage user={user} />} />
        <Route
          path="/staff"
          element={
            <ProtectedStaffRoute user={user}>
              <StaffPage user={user} onLogout={handleLogout} />
            </ProtectedStaffRoute>
          }
        />
        <Route path="/account" element={<AccountPage user={user} />} />
        <Route path="/my-posts" element={<MyPosts user={user} />} />
        <Route path="/saved-posts" element={<SavedPosts user={user} />} />
        <Route path="/orders" element={<MemberOrders user={user} />} />
        <Route path="/view-history" element={<ViewHistory user={user} />} />
        <Route path="/post-ad" element={<PostAd user={user} />} />
        <Route path="/verify-otp" element={<OTPVerificationPage />} />
        <Route path="/products/:type" element={<CategoryPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
      </Routes>
      {!isAuthPage && !isStaffPage && <Footer />}
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
