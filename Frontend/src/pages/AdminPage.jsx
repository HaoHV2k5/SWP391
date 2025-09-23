import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Users,
  Package,
  TrendingUp,
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  Lock,
  Unlock,
  UserPlus,
  Shield,
  CheckCircle,
  XCircle,
  Eye,
  Home,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";
import adminService from "../services/adminService";

const AdminPage = ({ user }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [newUser, setNewUser] = useState({
    fullname: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    gender: "Nam",
    yob: "01/01/1990",
    address: "Địa chỉ mặc định",
    role: "member",
  });

  // Mock data
  const [stats, setStats] = useState({
    totalUsers: 1250,
    totalProducts: 89,
    totalOrders: 456,
    totalRevenue: 1250000000,
  });

  const [users, setUsers] = useState([
    {
      id: 1,
      name: "Nguyễn Văn A",
      email: "nguyenvana@email.com",
      phone: "0123456789",
      status: "active",
      joinDate: "2024-01-15",
    },
    {
      id: 2,
      name: "Trần Thị B",
      email: "tranthib@email.com",
      phone: "0987654321",
      status: "active",
      joinDate: "2024-01-20",
    },
    {
      id: 3,
      name: "Lê Văn C",
      email: "levanc@email.com",
      phone: "0369258147",
      status: "inactive",
      joinDate: "2024-02-01",
    },
  ]);

  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Pin Lithium-ion 48V 20Ah",
      price: 2500000,
      category: "Pin",
      status: "active",
      stock: 15,
      createdAt: "2024-01-10",
    },
    {
      id: 2,
      name: "Xe điện VinFast Klara S",
      price: 15000000,
      category: "Xe điện",
      status: "active",
      stock: 3,
      createdAt: "2024-01-12",
    },
    {
      id: 3,
      name: "Pin sắt phosphate 60V 30Ah",
      price: 3200000,
      category: "Pin",
      status: "inactive",
      stock: 0,
      createdAt: "2024-01-15",
    },
  ]);

  const [orders, setOrders] = useState([
    {
      id: 1,
      customer: "Nguyễn Văn A",
      product: "Pin Lithium-ion 48V 20Ah",
      amount: 2500000,
      status: "completed",
      date: "2024-01-20",
    },
    {
      id: 2,
      customer: "Trần Thị B",
      product: "Xe điện VinFast Klara S",
      amount: 15000000,
      status: "pending",
      date: "2024-01-22",
    },
    {
      id: 3,
      customer: "Lê Văn C",
      product: "Pin sắt phosphate 60V 30Ah",
      amount: 3200000,
      status: "cancelled",
      date: "2024-01-25",
    },
  ]);

  useEffect(() => {
    console.log("=== AdminPage useEffect ===");
    console.log("AdminPage - User object:", user);
    console.log("AdminPage - User type:", typeof user);
    console.log("AdminPage - User keys:", user ? Object.keys(user) : "No user");

    // Thêm delay để đợi user state được cập nhật
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

    // User đã có, kiểm tra auth
    setIsCheckingAuth(false);

    // Kiểm tra role trong các cấu trúc khác nhau
    let userRole = null;
    if (user.user && user.user.role) {
      userRole = user.user.role;
      console.log("✅ Found role in user.user.role:", userRole);
    } else if (user.role) {
      userRole = user.role;
      console.log("✅ Found role in user.role:", userRole);
    } else if (user.roles && user.roles.length > 0) {
      userRole = user.roles[0].name || user.roles[0];
      console.log("✅ Found role in user.roles:", userRole);
    }

    console.log("🔍 Detected user role:", userRole);

    if (userRole !== "admin") {
      console.log("❌ User role is not admin:", userRole);
      navigate("/");
      toast.error("Bạn không có quyền truy cập trang admin!");
      return;
    }

    console.log("✅ Admin access granted");
    // Load users khi vào trang admin
    if (activeTab === "users") {
      console.log("🔄 Loading users...");
      loadUsers();
    }
  }, [user, navigate, activeTab]);

  // Load users khi activeTab thay đổi
  useEffect(() => {
    console.log(
      "🔍 Tab change detected - activeTab:",
      activeTab,
      "user:",
      !!user
    );
    if (activeTab === "users" && user) {
      console.log("🔄 Tab changed to users, loading users...");
      loadUsers();
    } else {
      console.log(
        "❌ Not loading users - activeTab:",
        activeTab,
        "user:",
        !!user
      );
    }
  }, [activeTab, user]);

  // Load users từ API
  const loadUsers = async () => {
    try {
      console.log("🔄 Starting loadUsers...");
      setLoading(true);

      // Debug: Kiểm tra token trong localStorage
      const token = localStorage.getItem("token");
      console.log("🔑 Current token:", token);
      console.log("🔑 Token type:", typeof token);
      console.log("🔑 Token length:", token ? token.length : 0);

      // Kiểm tra nếu token không hợp lệ
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
      console.log(
        "📋 First user locked status:",
        (response.data || response)[0]?.locked
      );
      console.log(
        "📋 All users locked status:",
        (response.data || response).map((user) => ({
          id: user.id,
          email: user.email,
          locked: user.locked,
        }))
      );
    } catch (error) {
      console.error("❌ Error loading users:", error);
      console.error("❌ Error details:", error.response?.data);
      console.error("❌ Error status:", error.response?.status);
      toast.error("Lỗi khi tải danh sách users!");
    } finally {
      setLoading(false);
    }
  };

  // Tạo user mới
  const handleCreateUser = async () => {
    try {
      setLoading(true);
      await adminService.createUser(newUser);
      toast.success("Tạo user thành công!");
      setShowCreateUserModal(false);
      setNewUser({
        fullname: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        gender: "Nam",
        yob: "01/01/1990",
        address: "Địa chỉ mặc định",
        role: "member",
      });
      loadUsers(); // Reload danh sách
    } catch (error) {
      console.error("Error creating user:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      toast.error(
        `Lỗi khi tạo user: ${error.response?.data?.message || error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  // Khóa user
  const handleLockUser = async (userId) => {
    try {
      console.log("🔒 Locking user:", userId);
      setLoading(true);
      await adminService.lockUser(userId);
      console.log("✅ User locked successfully");
      toast.success("Khóa user thành công!");
      loadUsers(); // Reload danh sách
    } catch (error) {
      console.error("❌ Error locking user:", error);
      toast.error("Lỗi khi khóa user!");
    } finally {
      setLoading(false);
    }
  };

  // Mở khóa user
  const handleUnlockUser = async (userId) => {
    try {
      console.log("🔓 Unlocking user:", userId);
      setLoading(true);
      await adminService.unlockUser(userId);
      console.log("✅ User unlocked successfully");
      toast.success("Mở khóa user thành công!");
      loadUsers(); // Reload danh sách
    } catch (error) {
      console.error("❌ Error unlocking user:", error);
      toast.error("Lỗi khi mở khóa user!");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
      case "completed":
        return "#28a745";
      case "inactive":
      case "cancelled":
        return "#dc3545";
      case "pending":
        return "#ffc107";
      default:
        return "#6c757d";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "active":
        return "Hoạt động";
      case "inactive":
        return "Không hoạt động";
      case "completed":
        return "Hoàn thành";
      case "pending":
        return "Chờ xử lý";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
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
        <div
          style={{
            width: "250px",
            backgroundColor: "rgba(26, 26, 46, 0.9)",
            backdropFilter: "blur(20px)",
            borderRight: "1px solid rgba(255, 255, 255, 0.1)",
            minHeight: "100vh",
            padding: "2rem 0",
          }}
        >
          <div style={{ padding: "0 2rem", marginBottom: "2rem" }}>
            <h2
              style={{
                color: "#ffffff",
                fontSize: "1.5rem",
                fontWeight: "700",
              }}
            >
              Admin Panel
            </h2>
            <p
              style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "0.9rem" }}
            >
              Quản lý hệ thống
            </p>
          </div>

          <nav>
            {[
              {
                id: "dashboard",
                label: "Tổng quan",
                icon: <TrendingUp size={20} />,
              },
              { id: "users", label: "Người dùng", icon: <Users size={20} /> },
              {
                id: "products",
                label: "Sản phẩm",
                icon: <Package size={20} />,
              },
              {
                id: "orders",
                label: "Đơn hàng",
                icon: <DollarSign size={20} />,
              },
              {
                id: "kyc",
                label: "KYC Approval",
                icon: <Shield size={20} />,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  console.log("🖱️ Tab clicked:", tab.id);
                  setActiveTab(tab.id);

                  // Gọi loadUsers() trực tiếp khi click tab "users"
                  if (tab.id === "users") {
                    console.log(
                      "🔄 Directly calling loadUsers() for users tab"
                    );
                    loadUsers();
                  }
                }}
                style={{
                  width: "100%",
                  padding: "1rem 2rem",
                  border: "none",
                  background:
                    activeTab === tab.id
                      ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                      : "transparent",
                  color:
                    activeTab === tab.id ? "white" : "rgba(255, 255, 255, 0.8)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  textAlign: "left",
                  transition: "all 0.3s",
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>

          {/* User Info & Logout */}
          <div
            style={{
              marginTop: "auto",
              padding: "1rem 2rem",
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                marginBottom: "1rem",
                padding: "1rem",
                background: "rgba(255, 255, 255, 0.05)",
                borderRadius: "10px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "1.2rem",
                }}
              >
                {user?.fullname?.charAt(0) || "A"}
              </div>
              <div>
                <p
                  style={{
                    color: "white",
                    margin: "0 0 0.25rem 0",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                  }}
                >
                  {user?.fullname || "Admin"}
                </p>
                <p
                  style={{
                    color: "rgba(255, 255, 255, 0.6)",
                    margin: 0,
                    fontSize: "0.8rem",
                  }}
                >
                  Quản trị viên
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("userData");
                toast.success("Đăng xuất thành công!");
                setTimeout(() => {
                  navigate("/login");
                }, 1000);
              }}
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "8px",
                color: "white",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                fontSize: "0.9rem",
                fontWeight: "500",
                transition: "all 0.3s ease",
                backdropFilter: "blur(10px)",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(255, 255, 255, 0.2)";
                e.target.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "rgba(255, 255, 255, 0.1)";
                e.target.style.transform = "translateY(0)";
              }}
            >
              <LogOut size={16} />
              Đăng xuất
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, padding: "2rem" }}>
          {/* Top Bar - Thay thế Navbar */}
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
                  {activeTab === "orders" && "Đơn hàng"}
                  {activeTab === "kyc" && "KYC Approval"}
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
              {activeTab === "orders" && "💰 Quản lý đơn hàng"}
              {activeTab === "kyc" && "🛡️ Duyệt KYC"}
            </h1>

            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <div style={{ position: "relative" }}>
                <Search
                  size={20}
                  style={{
                    position: "absolute",
                    left: "1rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "rgba(255, 255, 255, 0.7)",
                  }}
                />
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
              {/* <button className="btn btn-secondary">
                <Filter size={16} className="mr-1" />
                Lọc
              </button>
              <button className="btn btn-secondary">
                <Download size={16} className="mr-1" />
                Xuất
              </button> */}
            </div>
          </div>

          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div>
              {/* Stats Cards */}
              <div className="grid grid-2" style={{ marginBottom: "2rem" }}>
                <div className="card" style={{ textAlign: "center" }}>
                  <Users
                    size={48}
                    style={{ color: "#667eea", marginBottom: "1rem" }}
                  />
                  <h3
                    style={{
                      fontSize: "2rem",
                      marginBottom: "0.5rem",
                      color: "#333",
                    }}
                  >
                    {stats.totalUsers.toLocaleString()}
                  </h3>
                  <p style={{ color: "#666" }}>Tổng người dùng</p>
                </div>
                <div className="card" style={{ textAlign: "center" }}>
                  <Package
                    size={48}
                    style={{ color: "#28a745", marginBottom: "1rem" }}
                  />
                  <h3
                    style={{
                      fontSize: "2rem",
                      marginBottom: "0.5rem",
                      color: "#333",
                    }}
                  >
                    {stats.totalProducts}
                  </h3>
                  <p style={{ color: "#666" }}>Sản phẩm</p>
                </div>
                <div className="card" style={{ textAlign: "center" }}>
                  <DollarSign
                    size={48}
                    style={{ color: "#ffc107", marginBottom: "1rem" }}
                  />
                  <h3
                    style={{
                      fontSize: "2rem",
                      marginBottom: "0.5rem",
                      color: "#333",
                    }}
                  >
                    {stats.totalOrders}
                  </h3>
                  <p style={{ color: "#666" }}>Đơn hàng</p>
                </div>
                <div className="card" style={{ textAlign: "center" }}>
                  <TrendingUp
                    size={48}
                    style={{ color: "#dc3545", marginBottom: "1rem" }}
                  />
                  <h3
                    style={{
                      fontSize: "2rem",
                      marginBottom: "0.5rem",
                      color: "#333",
                    }}
                  >
                    {formatCurrency(stats.totalRevenue)}
                  </h3>
                  <p style={{ color: "#666" }}>Doanh thu</p>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="card">
                <h3 style={{ marginBottom: "1.5rem", color: "#333" }}>
                  Đơn hàng gần đây
                </h3>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid #e9ecef" }}>
                        <th style={{ padding: "1rem", textAlign: "left" }}>
                          ID
                        </th>
                        <th style={{ padding: "1rem", textAlign: "left" }}>
                          Khách hàng
                        </th>
                        <th style={{ padding: "1rem", textAlign: "left" }}>
                          Sản phẩm
                        </th>
                        <th style={{ padding: "1rem", textAlign: "left" }}>
                          Số tiền
                        </th>
                        <th style={{ padding: "1rem", textAlign: "left" }}>
                          Trạng thái
                        </th>
                        <th style={{ padding: "1rem", textAlign: "left" }}>
                          Ngày
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 5).map((order) => (
                        <tr
                          key={order.id}
                          style={{ borderBottom: "1px solid #e9ecef" }}
                        >
                          <td style={{ padding: "1rem" }}>#{order.id}</td>
                          <td style={{ padding: "1rem" }}>{order.customer}</td>
                          <td style={{ padding: "1rem" }}>{order.product}</td>
                          <td style={{ padding: "1rem" }}>
                            {formatCurrency(order.amount)}
                          </td>
                          <td style={{ padding: "1rem" }}>
                            <span
                              style={{
                                padding: "0.25rem 0.75rem",
                                borderRadius: "15px",
                                fontSize: "0.8rem",
                                backgroundColor:
                                  getStatusColor(order.status) + "20",
                                color: getStatusColor(order.status),
                              }}
                            >
                              {getStatusText(order.status)}
                            </span>
                          </td>
                          <td style={{ padding: "1rem" }}>{order.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "2rem",
                }}
              >
                <h3>Danh sách người dùng</h3>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowCreateUserModal(true)}
                >
                  <UserPlus size={16} className="mr-1" />
                  Thêm người dùng
                </button>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #e9ecef" }}>
                      <th style={{ padding: "1rem", textAlign: "left" }}>ID</th>
                      <th style={{ padding: "1rem", textAlign: "left" }}>
                        Tên
                      </th>
                      <th style={{ padding: "1rem", textAlign: "left" }}>
                        Email
                      </th>
                      <th style={{ padding: "1rem", textAlign: "left" }}>
                        Số điện thoại
                      </th>
                      <th style={{ padding: "1rem", textAlign: "left" }}>
                        Trạng thái
                      </th>
                      <th style={{ padding: "1rem", textAlign: "left" }}>
                        Ngày tham gia
                      </th>
                      <th style={{ padding: "1rem", textAlign: "left" }}>
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        style={{ borderBottom: "1px solid #e9ecef" }}
                      >
                        <td style={{ padding: "1rem" }}>#{user.id}</td>
                        <td style={{ padding: "1rem" }}>{user.name}</td>
                        <td style={{ padding: "1rem" }}>{user.email}</td>
                        <td style={{ padding: "1rem" }}>{user.phone}</td>
                        <td style={{ padding: "1rem" }}>
                          <span
                            style={{
                              padding: "0.25rem 0.75rem",
                              borderRadius: "15px",
                              fontSize: "0.8rem",
                              backgroundColor:
                                getStatusColor(user.status) + "20",
                              color: getStatusColor(user.status),
                            }}
                          >
                            {getStatusText(user.status)}
                          </span>
                        </td>
                        <td style={{ padding: "1rem" }}>{user.joinDate}</td>
                        <td style={{ padding: "1rem" }}>
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button
                              className="btn btn-secondary"
                              style={{ padding: "0.5rem" }}
                            >
                              <Edit size={16} />
                            </button>
                            {!user.locked ? (
                              <button
                                className="btn btn-secondary"
                                style={{
                                  padding: "0.5rem",
                                  backgroundColor: "#ffc107",
                                }}
                                onClick={() => handleLockUser(user.id)}
                                title="Khóa user"
                              >
                                <Unlock size={16} />
                              </button>
                            ) : (
                              <button
                                className="btn btn-secondary"
                                style={{
                                  padding: "0.5rem",
                                  backgroundColor: "#28a745",
                                }}
                                onClick={() => handleUnlockUser(user.id)}
                                title="Mở khóa user"
                              >
                                <Lock size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === "products" && (
            <div className="card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "2rem",
                }}
              >
                <h3>Danh sách sản phẩm</h3>
                <button className="btn btn-primary">
                  <Plus size={16} className="mr-1" />
                  Thêm sản phẩm
                </button>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #e9ecef" }}>
                      <th style={{ padding: "1rem", textAlign: "left" }}>ID</th>
                      <th style={{ padding: "1rem", textAlign: "left" }}>
                        Tên sản phẩm
                      </th>
                      <th style={{ padding: "1rem", textAlign: "left" }}>
                        Giá
                      </th>
                      <th style={{ padding: "1rem", textAlign: "left" }}>
                        Danh mục
                      </th>
                      <th style={{ padding: "1rem", textAlign: "left" }}>
                        Tồn kho
                      </th>
                      <th style={{ padding: "1rem", textAlign: "left" }}>
                        Trạng thái
                      </th>
                      <th style={{ padding: "1rem", textAlign: "left" }}>
                        Ngày tạo
                      </th>
                      <th style={{ padding: "1rem", textAlign: "left" }}>
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr
                        key={product.id}
                        style={{ borderBottom: "1px solid #e9ecef" }}
                      >
                        <td style={{ padding: "1rem" }}>#{product.id}</td>
                        <td style={{ padding: "1rem" }}>{product.name}</td>
                        <td style={{ padding: "1rem" }}>
                          {formatCurrency(product.price)}
                        </td>
                        <td style={{ padding: "1rem" }}>{product.category}</td>
                        <td style={{ padding: "1rem" }}>{product.stock}</td>
                        <td style={{ padding: "1rem" }}>
                          <span
                            style={{
                              padding: "0.25rem 0.75rem",
                              borderRadius: "15px",
                              fontSize: "0.8rem",
                              backgroundColor:
                                getStatusColor(product.status) + "20",
                              color: getStatusColor(product.status),
                            }}
                          >
                            {getStatusText(product.status)}
                          </span>
                        </td>
                        <td style={{ padding: "1rem" }}>{product.createdAt}</td>
                        <td style={{ padding: "1rem" }}>
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button
                              className="btn btn-secondary"
                              style={{ padding: "0.5rem" }}
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              className="btn btn-secondary"
                              style={{
                                padding: "0.5rem",
                                backgroundColor: "#dc3545",
                              }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div className="card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "2rem",
                }}
              >
                <h3>Danh sách đơn hàng</h3>
                <button className="btn btn-primary">
                  <Plus size={16} className="mr-1" />
                  Tạo đơn hàng
                </button>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #e9ecef" }}>
                      <th style={{ padding: "1rem", textAlign: "left" }}>ID</th>
                      <th style={{ padding: "1rem", textAlign: "left" }}>
                        Khách hàng
                      </th>
                      <th style={{ padding: "1rem", textAlign: "left" }}>
                        Sản phẩm
                      </th>
                      <th style={{ padding: "1rem", textAlign: "left" }}>
                        Số tiền
                      </th>
                      <th style={{ padding: "1rem", textAlign: "left" }}>
                        Trạng thái
                      </th>
                      <th style={{ padding: "1rem", textAlign: "left" }}>
                        Ngày
                      </th>
                      <th style={{ padding: "1rem", textAlign: "left" }}>
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr
                        key={order.id}
                        style={{ borderBottom: "1px solid #e9ecef" }}
                      >
                        <td style={{ padding: "1rem" }}>#{order.id}</td>
                        <td style={{ padding: "1rem" }}>{order.customer}</td>
                        <td style={{ padding: "1rem" }}>{order.product}</td>
                        <td style={{ padding: "1rem" }}>
                          {formatCurrency(order.amount)}
                        </td>
                        <td style={{ padding: "1rem" }}>
                          <span
                            style={{
                              padding: "0.25rem 0.75rem",
                              borderRadius: "15px",
                              fontSize: "0.8rem",
                              backgroundColor:
                                getStatusColor(order.status) + "20",
                              color: getStatusColor(order.status),
                            }}
                          >
                            {getStatusText(order.status)}
                          </span>
                        </td>
                        <td style={{ padding: "1rem" }}>{order.date}</td>
                        <td style={{ padding: "1rem" }}>
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button
                              className="btn btn-secondary"
                              style={{ padding: "0.5rem" }}
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              className="btn btn-secondary"
                              style={{
                                padding: "0.5rem",
                                backgroundColor: "#dc3545",
                              }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* KYC Approval Tab */}
          {activeTab === "kyc" && (
            <div className="card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "2rem",
                }}
              >
                <h3>Duyệt KYC - Xác thực danh tính</h3>
                <div style={{ display: "flex", gap: "1rem" }}>
                  <button className="btn btn-secondary">
                    <Filter size={16} className="mr-1" />
                    Lọc
                  </button>
                  <button className="btn btn-primary">
                    <Download size={16} className="mr-1" />
                    Xuất báo cáo
                  </button>
                </div>
              </div>

              {/* KYC Stats */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "1rem",
                  marginBottom: "2rem",
                }}
              >
                <div
                  style={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    padding: "1.5rem",
                    borderRadius: "10px",
                    textAlign: "center",
                  }}
                >
                  <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "1.5rem" }}>
                    15
                  </h4>
                  <p style={{ margin: 0, opacity: 0.9 }}>Chờ duyệt</p>
                </div>
                <div
                  style={{
                    background:
                      "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                    color: "white",
                    padding: "1.5rem",
                    borderRadius: "10px",
                    textAlign: "center",
                  }}
                >
                  <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "1.5rem" }}>
                    128
                  </h4>
                  <p style={{ margin: 0, opacity: 0.9 }}>Đã duyệt</p>
                </div>
                <div
                  style={{
                    background:
                      "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                    color: "white",
                    padding: "1.5rem",
                    borderRadius: "10px",
                    textAlign: "center",
                  }}
                >
                  <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "1.5rem" }}>
                    8
                  </h4>
                  <p style={{ margin: 0, opacity: 0.9 }}>Từ chối</p>
                </div>
                <div
                  style={{
                    background:
                      "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                    color: "white",
                    padding: "1.5rem",
                    borderRadius: "10px",
                    textAlign: "center",
                  }}
                >
                  <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "1.5rem" }}>
                    151
                  </h4>
                  <p style={{ margin: 0, opacity: 0.9 }}>Tổng cộng</p>
                </div>
              </div>

              {/* KYC List */}
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #e9ecef" }}>
                      <th style={{ padding: "1rem", textAlign: "left" }}>ID</th>
                      <th style={{ padding: "1rem", textAlign: "left" }}>
                        Tên
                      </th>
                      <th style={{ padding: "1rem", textAlign: "left" }}>
                        Email
                      </th>
                      <th style={{ padding: "1rem", textAlign: "left" }}>
                        Số điện thoại
                      </th>
                      <th style={{ padding: "1rem", textAlign: "left" }}>
                        Trạng thái
                      </th>
                      <th style={{ padding: "1rem", textAlign: "left" }}>
                        Ngày nộp
                      </th>
                      <th style={{ padding: "1rem", textAlign: "left" }}>
                        Hình ảnh
                      </th>
                      <th style={{ padding: "1rem", textAlign: "left" }}>
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        id: 1,
                        name: "Nguyễn Văn A",
                        email: "nguyenvana@email.com",
                        phone: "0123456789",
                        status: "pending",
                        submitDate: "2024-01-15",
                        images: ["cc_front.jpg", "cc_back.jpg", "selfie.jpg"],
                      },
                      {
                        id: 2,
                        name: "Trần Thị B",
                        email: "tranthib@email.com",
                        phone: "0987654321",
                        status: "approved",
                        submitDate: "2024-01-14",
                        images: ["cc_front.jpg", "cc_back.jpg", "selfie.jpg"],
                      },
                      {
                        id: 3,
                        name: "Lê Văn C",
                        email: "levanc@email.com",
                        phone: "0369258147",
                        status: "rejected",
                        submitDate: "2024-01-13",
                        images: ["cc_front.jpg", "cc_back.jpg", "selfie.jpg"],
                      },
                    ].map((kyc) => (
                      <tr
                        key={kyc.id}
                        style={{ borderBottom: "1px solid #e9ecef" }}
                      >
                        <td style={{ padding: "1rem" }}>#{kyc.id}</td>
                        <td style={{ padding: "1rem" }}>{kyc.name}</td>
                        <td style={{ padding: "1rem" }}>{kyc.email}</td>
                        <td style={{ padding: "1rem" }}>{kyc.phone}</td>
                        <td style={{ padding: "1rem" }}>
                          <span
                            style={{
                              padding: "0.25rem 0.75rem",
                              borderRadius: "20px",
                              fontSize: "0.875rem",
                              fontWeight: "500",
                              backgroundColor:
                                kyc.status === "pending"
                                  ? "#fff3cd"
                                  : kyc.status === "approved"
                                  ? "#d4edda"
                                  : "#f8d7da",
                              color:
                                kyc.status === "pending"
                                  ? "#856404"
                                  : kyc.status === "approved"
                                  ? "#155724"
                                  : "#721c24",
                            }}
                          >
                            {kyc.status === "pending"
                              ? "Chờ duyệt"
                              : kyc.status === "approved"
                              ? "Đã duyệt"
                              : "Từ chối"}
                          </span>
                        </td>
                        <td style={{ padding: "1rem" }}>{kyc.submitDate}</td>
                        <td style={{ padding: "1rem" }}>
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            {kyc.images.map((image, index) => (
                              <button
                                key={index}
                                style={{
                                  padding: "0.5rem",
                                  background: "#f8f9fa",
                                  border: "1px solid #dee2e6",
                                  borderRadius: "5px",
                                  cursor: "pointer",
                                  fontSize: "0.75rem",
                                }}
                                onClick={() => {
                                  // Xem hình ảnh
                                  alert(`Xem hình ảnh: ${image}`);
                                }}
                              >
                                {image}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td style={{ padding: "1rem" }}>
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            {kyc.status === "pending" && (
                              <>
                                <button
                                  className="btn btn-primary"
                                  style={{
                                    padding: "0.5rem 1rem",
                                    fontSize: "0.875rem",
                                    background: "#28a745",
                                    border: "none",
                                    borderRadius: "5px",
                                    color: "white",
                                    cursor: "pointer",
                                  }}
                                  onClick={() => {
                                    // Duyệt KYC
                                    alert(`Duyệt KYC cho ${kyc.name}`);
                                  }}
                                >
                                  <CheckCircle
                                    size={16}
                                    style={{ marginRight: "0.25rem" }}
                                  />
                                  Duyệt
                                </button>
                                <button
                                  className="btn btn-secondary"
                                  style={{
                                    padding: "0.5rem 1rem",
                                    fontSize: "0.875rem",
                                    background: "#dc3545",
                                    border: "none",
                                    borderRadius: "5px",
                                    color: "white",
                                    cursor: "pointer",
                                  }}
                                  onClick={() => {
                                    // Từ chối KYC
                                    alert(`Từ chối KYC cho ${kyc.name}`);
                                  }}
                                >
                                  <XCircle
                                    size={16}
                                    style={{ marginRight: "0.25rem" }}
                                  />
                                  Từ chối
                                </button>
                              </>
                            )}
                            <button
                              className="btn btn-secondary"
                              style={{
                                padding: "0.5rem",
                                background: "#6c757d",
                                border: "none",
                                borderRadius: "5px",
                                color: "white",
                                cursor: "pointer",
                              }}
                              onClick={() => {
                                // Xem chi tiết
                                alert(`Xem chi tiết KYC của ${kyc.name}`);
                              }}
                            >
                              <Eye size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal tạo user mới */}
      {showCreateUserModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "2rem",
              borderRadius: "10px",
              width: "500px",
              maxWidth: "90vw",
            }}
          >
            <h3 style={{ marginBottom: "1.5rem", color: "#333" }}>
              Tạo user mới
            </h3>

            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "bold",
                }}
              >
                Họ tên:
              </label>
              <input
                type="text"
                value={newUser.fullname}
                onChange={(e) =>
                  setNewUser({ ...newUser, fullname: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "2px solid #e9ecef",
                  borderRadius: "5px",
                  fontSize: "1rem",
                }}
                placeholder="Nhập họ tên"
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "bold",
                }}
              >
                Email:
              </label>
              <input
                type="email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "2px solid #e9ecef",
                  borderRadius: "5px",
                  fontSize: "1rem",
                }}
                placeholder="Nhập email"
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "bold",
                }}
              >
                Số điện thoại:
              </label>
              <input
                type="tel"
                value={newUser.phone}
                onChange={(e) =>
                  setNewUser({ ...newUser, phone: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "2px solid #e9ecef",
                  borderRadius: "5px",
                  fontSize: "1rem",
                }}
                placeholder="Nhập số điện thoại"
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "bold",
                }}
              >
                Mật khẩu:
              </label>
              <input
                type="password"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "2px solid #e9ecef",
                  borderRadius: "5px",
                  fontSize: "1rem",
                }}
                placeholder="Nhập mật khẩu"
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "bold",
                }}
              >
                Xác nhận mật khẩu:
              </label>
              <input
                type="password"
                value={newUser.confirmPassword}
                onChange={(e) =>
                  setNewUser({ ...newUser, confirmPassword: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "2px solid #e9ecef",
                  borderRadius: "5px",
                  fontSize: "1rem",
                }}
                placeholder="Nhập lại mật khẩu"
              />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "bold",
                }}
              >
                Vai trò:
              </label>
              <select
                value={newUser.role}
                onChange={(e) =>
                  setNewUser({ ...newUser, role: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "2px solid #e9ecef",
                  borderRadius: "5px",
                  fontSize: "1rem",
                }}
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div
              style={{
                display: "flex",
                gap: "1rem",
                justifyContent: "flex-end",
              }}
            >
              <button
                className="btn btn-secondary"
                onClick={() => setShowCreateUserModal(false)}
                disabled={loading}
              >
                Hủy
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCreateUser}
                disabled={loading}
              >
                {loading ? "Đang tạo..." : "Tạo user"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
