import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminPage from "./pages/AdminPage";
import StaffPage from "./pages/StaffPage"; //STAFF PAGE - Trang dành cho nhân viên
import MemberOrders from "./pages/member/MemberOrders";
import PostAd from "./pages/member/PostAd";
import MyPosts from "./pages/member/MyPosts";
import SavedPosts from "./pages/member/SavedPosts";
import ViewHistory from "./pages/member/ViewHistory";
import AccountPage from "./pages/AccountPage";
import OTPVerificationPage from "./pages/OTPVerificationPage";
import "./App.css";
import CategoryPage from "./components/homepageContainer/layout/CategoryPage";
import { SavedProductsProvider } from "./components/homepageContainer/contexts/SavedProductsContext";

function AppContent() {
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    // Kiểm tra token từ URL (Google login)
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const email = urlParams.get("email");
    const name = urlParams.get("name");

    if (token && email && name) {
      console.log("=== Google Login detected from URL ===");
      console.log("Token:", token);
      console.log("Email:", email);
      console.log("Name:", name);

      // Tạo user data từ URL params
      const userData = {
        id: email,
        email: email,
        fullName: name,
        avatar: "", // Có thể lấy từ backend sau
        role: "member",
        token: token, // Sử dụng token thật từ backend
      };

      console.log("=== Setting user data ===");
      console.log("UserData:", userData);
      console.log("UserData type:", typeof userData);
      console.log("UserData keys:", Object.keys(userData));

      // Lưu vào localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("userData", JSON.stringify(userData));

      // Set user state
      setUser(userData);

      // Hiển thị thông báo thành công
      console.log("=== Showing notification ===");

      // Delay toast để đảm bảo component đã render xong
      setTimeout(() => {
        // Toast chính
        toast.success(`Chào mừng ${name}! Đăng nhập Google thành công!`);
        console.log("=== react-toastify called ===");
      }, 100);

      // Xóa URL params
      window.history.replaceState({}, document.title, window.location.pathname);

      return;
    }

    // Kiểm tra user data trong localStorage (login thường)
    const checkUserData = () => {
      console.log("=== Checking localStorage ===");
      const userData = localStorage.getItem("userData");
      const token = localStorage.getItem("token");

      console.log("Token:", token);
      console.log("UserData:", userData);

      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          console.log("Parsed user data:", parsedUser);

          // Kiểm tra token trong userData nếu không có token riêng
          if (!token && parsedUser.token) {
            console.log("Using token from userData:", parsedUser.token);
            localStorage.setItem("token", parsedUser.token);
          }

          setUser(parsedUser);
        } catch (error) {
          console.error("Error parsing user data:", error);
          localStorage.removeItem("userData");
          localStorage.removeItem("token");
        }
      }
    };

    // Check ngay lập tức
    checkUserData();
  }, []);

  const handleLogin = (userData) => {
    console.log("=== handleLogin called ===");
    console.log("UserData received:", userData);
    console.log("UserData type:", typeof userData);
    console.log("UserData keys:", Object.keys(userData));

    setUser(userData);
    localStorage.setItem("token", userData.token);
    localStorage.setItem("userData", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("userData");

    // Hiển thị thông báo đăng xuất thành công
    toast.success("Đăng xuất thành công!");
  };

  // Kiểm tra xem có phải trang đăng nhập hoặc đăng ký không
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  // Kiểm tra xem có phải trang staff không
  const isStaffPage = location.pathname === "/staff";

  // Kiểm tra xem user có role staff không
  const isStaffUser =
    user &&
    (user.role === "staff" ||
      user.role === "ROLE_STAFF" ||
      (user.user &&
        (user.user.role === "staff" || user.user.role === "ROLE_STAFF")));

  // Kiểm tra quyền truy cập - staff chỉ có thể truy cập trang staff
  useEffect(() => {
    // Chỉ kiểm tra khi có user và không phải trang đăng nhập/đăng ký
    if (isStaffUser && !isAuthPage && !isStaffPage) {
      // Tự động đăng xuất staff khi cố gắng truy cập trang khác
      toast.error("Staff không có quyền truy cập trang này! Đang đăng xuất...");
      setTimeout(() => {
        handleLogout();
      }, 1000);
    }
  }, [isStaffUser, isAuthPage, isStaffPage, handleLogout]);

  return (
    <div className="App">
      {/* Chỉ hiển thị Navbar cho trang chủ, admin và OTP, không hiển thị cho staff */}
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
          element={<StaffPage user={user} onLogout={handleLogout} />}
        />

        {/* Các route riêng biệt cho từng field */}
        <Route path="/account" element={<AccountPage user={user} />} />
        <Route path="/my-posts" element={<MyPosts user={user} />} />
        <Route path="/saved-posts" element={<SavedPosts user={user} />} />
        <Route path="/orders" element={<MemberOrders user={user} />} />
        <Route path="/view-history" element={<ViewHistory user={user} />} />
        <Route path="/post-ad" element={<PostAd user={user} />} />
        <Route path="/verify-otp" element={<OTPVerificationPage />} />
        <Route path="/products/:type" element={<CategoryPage />} />
      </Routes>

      {/* Chỉ hiển thị Footer cho trang chủ và admin, không hiển thị cho staff */}
      {!isAuthPage && !isStaffPage && <Footer />}

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

function App() {
  return (
    <Router>
      <SavedProductsProvider>
        <AppContent />
      </SavedProductsProvider>
    </Router>
  );
}

export default App;
