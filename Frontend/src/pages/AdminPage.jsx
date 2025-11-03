import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { Home, Bell, Settings } from "lucide-react";
import adminService from "../services/adminService";
import AdminSidebar from "../components/admin/AdminSidebar";
import DashboardTab from "../components/admin/DashboardTab";
import UsersTab from "../components/admin/UsersTab";
import ProductsTab from "../components/admin/ProductsTab";
import RevenueTab from "../components/admin/RevenueTab";
import KYCTab from "../components/admin/KYCTab";
import AdminComplaintTab from "../components/admin/AdminComplaintTab";
import RolesManagementTab from "../components/admin/RolesManagementTab";

const AdminPage = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get active tab from URL
  const getActiveTabFromPath = useCallback(() => {
    const path = location.pathname;
    if (path === "/admin/users") return "users";
    if (path === "/admin/products") return "products";
    if (path === "/admin/revenue") return "revenue";
    if (path === "/admin/kyc") return "kyc";
    if (path === "/admin/complaints") return "complaints";
    if (path === "/admin/roles") return "roles";
    if (path === "/admin") return "dashboard";
    return "dashboard";
  }, [location.pathname]);

  const [activeTab, setActiveTab] = useState(getActiveTabFromPath());
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [users, setUsers] = useState([]);
  const [isManualUpdate, setIsManualUpdate] = useState(false);

  // Mock data for dashboard
  const [stats] = useState({
    totalUsers: 1250,
    totalProducts: 89,
    totalOrders: 456,
    totalRevenue: 1250000000,
  });

  // Load users từ API - chỉ load khi cần thiết
  const loadUsers = useCallback(async () => {
    // Tránh load users khi không cần thiết
    if (activeTab !== "users" && activeTab !== "dashboard") {
      console.log("🚫 Skipping loadUsers - not on users or dashboard tab");
      return;
    }

    // Tránh load lại nếu đã có data và không loading và không phải manual update
    if (users.length > 0 && !loading && !isManualUpdate) {
      console.log(
        "🚫 Skipping loadUsers - data already exists and not manual update"
      );
      return;
    }

    try {
      console.log("🔄 Starting loadUsers...");
      setLoading(true);

      const token = localStorage.getItem("token");
      console.log("🔑 Current token:", token);

      if (!token || token === "admin-token-123") {
        console.error("❌ Invalid token! Please login properly.");
        toast.error("Vui lòng đăng nhập lại!");
        navigate("/login");
        return;
      }

      console.log("📡 Calling adminService.getAllUsers()...");
      const response = await adminService.getAllUsers();
      console.log("📡 API Response:", response);

      setUsers(response.data || response);
      console.log("📋 Users loaded:", response.data || response);
    } catch (error) {
      console.error("❌ Error loading users:", error);
      console.error("❌ Error details:", error.response?.data);
      console.error("❌ Error status:", error.response?.status);
      toast.error("Lỗi khi tải danh sách users!");
    } finally {
      setLoading(false);
      setIsManualUpdate(false); // Reset flag sau khi load xong
    }
  }, [navigate, activeTab, users.length, loading, isManualUpdate]);

  // Sync activeTab with URL changes
  useEffect(() => {
    const newActiveTab = getActiveTabFromPath();
    setActiveTab(newActiveTab);
  }, [location.pathname, getActiveTabFromPath]);

  // Authentication check - simplified vì đã có ProtectedAdminRoute ở App.jsx
  useEffect(() => {
    console.log("=== AdminPage useEffect ===");
    console.log("AdminPage - User object:", user);

    if (!user) {
      console.log("⏳ No user yet, waiting...");
      setIsCheckingAuth(true);
      const timer = setTimeout(() => {
        console.log("⏰ Timeout reached, checking again...");
        if (!user) {
          console.log("❌ Still no user after timeout, redirecting to login");
          navigate("/login");
        }
      }, 1000);

      return () => clearTimeout(timer);
    }

    // User đã có, set checking auth = false
    setIsCheckingAuth(false);
    console.log("✅ Admin access granted");
  }, [user, navigate]);

  // Load users when tab changes to users - chỉ chạy khi cần thiết
  useEffect(() => {
    console.log(
      "🔍 Tab change detected - activeTab:",
      activeTab,
      "user:",
      !!user,
      "isManualUpdate:",
      isManualUpdate
    );

    // Chỉ load users khi:
    // 1. Đang ở tab users hoặc dashboard
    // 2. User đã được authenticate
    // 3. Chưa có data hoặc đang loading hoặc là manual update
    if (
      (activeTab === "users" || activeTab === "dashboard") &&
      user &&
      (users.length === 0 || loading || isManualUpdate)
    ) {
      console.log(`🔄 Tab changed to ${activeTab}, loading users...`);
      loadUsers();
    }
  }, [activeTab, user, loadUsers, users.length, loading, isManualUpdate]);

  // Handle tab change - tối ưu để tránh duplicate calls
  const handleTabChange = (tabId) => {
    console.log("🔄 Tab change requested:", tabId);

    // Chỉ navigate, không gọi loadUsers ở đây
    // loadUsers sẽ được gọi tự động bởi useEffect khi activeTab thay đổi
    setActiveTab(tabId);

    // Navigate đến URL tương ứng
    if (tabId === "dashboard") {
      navigate("/admin");
    } else {
      navigate(`/admin/${tabId}`);
    }
  };

  // Debug activeTab changes - thêm thông tin về render
  useEffect(() => {
    console.log("🔍 activeTab changed to:", activeTab);
    console.log("🔍 Current tab content will render:", {
      dashboard: activeTab === "dashboard",
      users: activeTab === "users",
      products: activeTab === "products",
      kyc: activeTab === "kyc",
    });
  }, [activeTab]);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    toast.success("Đăng xuất thành công!");
    setTimeout(() => {
      navigate("/"); // Redirect về homepage thay vì login
    }, 500);
  };

  if (isCheckingAuth) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#f8f9fa",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "50px",
              height: "50px",
              border: "5px solid #f3f3f3",
              borderTop: "5px solid #667eea",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 1rem",
            }}
          ></div>
          <p style={{ color: "#666", fontSize: "1.1rem" }}>
            Đang kiểm tra quyền truy cập...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          
          .card {
            background: rgba(26, 26, 46, 0.8) !important;
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            border-radius: 15px !important;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
            color: white !important;
          }
          
          .card h3, .card h4, .card p {
            color: white !important;
          }
          
          .card table {
            color: white !important;
          }
          
          .card th, .card td {
            color: white !important;
            border-color: rgba(255, 255, 255, 0.1) !important;
          }
          
          .btn {
            background: rgba(255, 255, 255, 0.1) !important;
            border: 1px solid rgba(255, 255, 255, 0.2) !important;
            color: white !important;
            backdrop-filter: blur(10px);
          }
          
          .btn:hover {
            background: rgba(255, 255, 255, 0.2) !important;
            transform: translateY(-2px);
          }
          
          .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
            border: none !important;
          }
        `}
      </style>

      <div style={{ display: "flex" }}>
        {/* Sidebar */}
        <AdminSidebar
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          user={user}
          onLogout={handleLogout}
        />

        {/* Main Content */}
        <div style={{ flex: 1, padding: "2rem" }}>
          {/* Top Bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "2rem",
              padding: "1rem 0",
            }}
          >
            {/* Breadcrumb & Status */}
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  color: "rgba(255, 255, 255, 0.8)",
                  fontSize: "0.9rem",
                }}
              >
                <Home size={16} />
                <span>Trang chủ</span>
                <span>/</span>
                <span style={{ color: "white", fontWeight: "600" }}>
                  {activeTab === "dashboard" && "Tổng quan"}
                  {activeTab === "users" && "Người dùng"}
                  {activeTab === "products" && "Sản phẩm"}
                  {activeTab === "revenue" && "Doanh thu"}
                  {activeTab === "kyc" && "KYC Approval"}
                  {activeTab === "complaints" && "Khiếu nại"}
                  {activeTab === "roles" && "Phân quyền"}
                </span>
              </div>
            </div>

            {/* Quick Stats & Actions */}
            <div
              style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}
            >
              {/* System Status */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.5rem 1rem",
                  background: "rgba(67, 233, 123, 0.1)",
                  border: "1px solid rgba(67, 233, 123, 0.3)",
                  borderRadius: "20px",
                  color: "#43e97b",
                  fontSize: "0.8rem",
                  fontWeight: "500",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#43e97b",
                    animation: "pulse 2s infinite",
                  }}
                />
                Hệ thống hoạt động
              </div>

              {/* Notifications */}
              <button
                style={{
                  padding: "0.75rem",
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "10px",
                  color: "white",
                  cursor: "pointer",
                  position: "relative",
                  transition: "all 0.3s ease",
                }}
              >
                <Bell size={20} />
                <div
                  style={{
                    position: "absolute",
                    top: "-5px",
                    right: "-5px",
                    width: "20px",
                    height: "20px",
                    background: "#ff4757",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.7rem",
                    fontWeight: "bold",
                  }}
                >
                  3
                </div>
              </button>

              {/* Settings */}
              <button
                style={{
                  padding: "0.75rem",
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "10px",
                  color: "white",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
              >
                <Settings size={20} />
              </button>
            </div>
          </div>

          {/* Header */}
          <div
            style={{
              backgroundColor: "rgba(26, 26, 46, 0.8)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              padding: "1.5rem 2rem",
              borderRadius: "15px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
              marginBottom: "2rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h1
              style={{
                color: "#ffffff",
                fontSize: "2rem",
                fontWeight: "700",
                textShadow: "0 2px 4px rgba(0,0,0,0.3)",
              }}
            >
              {activeTab === "dashboard" && "📊 Tổng quan"}
              {activeTab === "users" && "👥 Quản lý người dùng"}
              {activeTab === "products" && "📦 Quản lý sản phẩm"}
              {activeTab === "revenue" && "💰 Quản lý doanh thu"}
              {activeTab === "kyc" && "🛡️ Duyệt KYC"}
              {activeTab === "complaints" && "⚠️ Quản lý khiếu nại"}
              {activeTab === "roles" && "🔐 Quản lý phân quyền"}
            </h1>

            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    padding: "0.75rem 1rem 0.75rem 3rem",
                    border: "2px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "10px",
                    fontSize: "1rem",
                    width: "300px",
                    background: "rgba(255, 255, 255, 0.1)",
                    color: "white",
                    backdropFilter: "blur(10px)",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div
            style={{
              backgroundColor: "rgba(26, 26, 46, 0.8)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "15px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
              padding: "2rem",
              color: "white",
            }}
          >
            {/* Dashboard Tab */}
            {activeTab === "dashboard" && (
              <div key="dashboard-content">
                <DashboardTab stats={stats} users={users} />
              </div>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
              <div key="users-content">
                <UsersTab
                  users={users}
                  setUsers={setUsers}
                  loading={loading}
                  setLoading={setLoading}
                  setIsManualUpdate={setIsManualUpdate}
                />
              </div>
            )}

            {/* Products Tab */}
            {activeTab === "products" && (
              <div key="products-content">
                <ProductsTab />
              </div>
            )}

            {/* Revenue Tab */}
            {activeTab === "revenue" && (
              <div key="revenue-content">
                <RevenueTab />
              </div>
            )}

            {/* KYC Tab */}
            {activeTab === "kyc" && (
              <div key="kyc-content">
                <KYCTab />
              </div>
            )}

            {/* Complaints Tab */}
            {activeTab === "complaints" && (
              <div key="complaints-content">
                <AdminComplaintTab />
              </div>
            )}

            {/* Roles Tab */}
            {activeTab === "roles" && (
              <div key="roles-content">
                <RolesManagementTab />
              </div>
            )}

            {/* Fallback - nếu không có tab nào match */}
            {!["dashboard", "users", "products", "revenue", "kyc", "complaints", "roles"].includes(activeTab) && (
              <div style={{ textAlign: "center", padding: "2rem" }}>
                <p style={{ color: "rgba(255, 255, 255, 0.7)" }}>
                  Tab không xác định: {activeTab}
                </p>
                <button
                  onClick={() => handleTabChange("dashboard")}
                  style={{
                    padding: "0.5rem 1rem",
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    border: "none",
                    borderRadius: "8px",
                    color: "white",
                    cursor: "pointer",
                    marginTop: "1rem",
                  }}
                >
                  Về trang tổng quan
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
