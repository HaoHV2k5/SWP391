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
import ViewHistory from "./pages/member/ViewHistory";
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
import firebaseAuthService from "./services/firebaseAuthService";

function AppContent() {
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // --- Firebase Auth State Listener ---
  useEffect(() => {
    console.log("🔥 Setting up Firebase Auth State Listener...");

    const unsubscribe = firebaseAuthService.onAuthStateChanged(
      async (firebaseUser) => {
        console.log("🔥 Firebase Auth State Changed:", firebaseUser);

        if (firebaseUser) {
          // User is signed in with Firebase
          console.log("✅ Firebase user is signed in:", firebaseUser.email);
          try {
            // Directly use Firebase token and user data
            const firebaseToken = await firebaseUser.getIdToken();
            const userData = {
              id: firebaseUser.uid,
              email: firebaseUser.email,
              fullName: firebaseUser.displayName,
              avatar: firebaseUser.photoURL,
              role: "member", // Default role
              provider: firebaseUser.providerData[0]?.providerId || "firebase",
              token: firebaseToken,
              firebaseUid: firebaseUser.uid,
              username: firebaseUser.email, // For compatibility
              verified: true,
              locked: false,
            };

            console.log("💾 Saving Firebase user data:", userData);
            localStorage.setItem("token", firebaseToken);
            localStorage.setItem("userData", JSON.stringify(userData));
            setUser(userData);

            // Redirect to homepage after successful login
            if (location.pathname === "/login") {
              console.log("🔄 Redirecting to homepage...");
              navigate("/", { replace: true });
            }
          } catch (error) {
            console.error("Error getting Firebase token:", error);
          }
        } else {
          // Firebase user is signed out
          console.log("❌ Firebase user is signed out");

          // Check if we have a regular user logged in
          const existingToken = localStorage.getItem("token");
          const existingUserData = localStorage.getItem("userData");

          if (existingToken && existingUserData && !user?.firebaseUid) {
            // We have a regular user logged in, don't clear it
            console.log("✅ Regular user still logged in, keeping state");
            return;
          }

          // Only clear if no regular user is logged in
          console.log("🧹 Clearing user state (no regular user)");
          setUser(null);
          localStorage.removeItem("token");
          localStorage.removeItem("userData");
        }
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [location.pathname, navigate, user?.firebaseUid]);

  // --- Load user from localStorage on app start ---
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("userData");

    if (token && userData) {
      try {
        const parsedUserData = JSON.parse(userData);
        setUser(parsedUserData);
        console.log("✅ User loaded from localStorage:", parsedUserData);
      } catch (error) {
        console.error("Error parsing userData from localStorage:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
      }
    }
  }, []);

  const handleLogin = (loginResponse) => {
    console.log("🔍 handleLogin called with:", loginResponse);
    try {
      const normalized = normalizeLoginResponse(loginResponse);
      console.log("🔍 normalized:", normalized);
      const userData = persistAuth(normalized);
      console.log("🔍 userData:", userData);
      setUser(userData);
      console.log("✅ User state updated successfully");
    } catch (error) {
      console.error("❌ Error in handleLogin:", error);
    }
  };

  const handleLogout = async () => {
    try {
      // Nếu là Firebase user, gọi Firebase signOut
      if (user?.firebaseUid) {
        await firebaseAuthService.signOut();
      }

      // Clear local state và localStorage
      setUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("userData");
      localStorage.removeItem("refreshToken");

      toast.success("Đăng xuất thành công!");
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      // Fallback: clear local state even if Firebase logout fails
      setUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("userData");
      localStorage.removeItem("refreshToken");
      toast.success("Đăng xuất thành công!");
      navigate("/", { replace: true });
    }
  };

  // --- Xác định bối cảnh trang để ẩn Navbar/Footer ---
  const path = location.pathname;
  const isAuthPage =
    path === "/login" || path === "/register" || path === "/verify-otp";

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
        <Route path="/view-history" element={<ViewHistory user={user} />} />
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
