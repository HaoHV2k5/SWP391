import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import StaffSidebar from "../components/staff/StaffSidebar";
import StaffHeader from "../components/staff/StaffHeader";
import DashboardTab from "../components/staff/DashboardTab";
import "../styles/staff/index.css";
import {
  Plus,
  Edit,
  Trash2,
  Filter,
  Download,
  Eye,
  UserCheck,
} from "lucide-react";

const StaffPage = ({ user }) => {
  const navigate = useNavigate();

  // ========================================
  // STATE MANAGEMENT
  // ========================================
  const [activeTab, setActiveTab] = useState("dashboard"); // Tab hiện tại: dashboard, orders, customers, products
  const [searchQuery, setSearchQuery] = useState(""); // Từ khóa tìm kiếm
  const [loading, setLoading] = useState(false); // Loading state cho các operations
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); // Kiểm tra authentication

  // ========================================
  // MOCK DATA - Dữ liệu giả lập để demo
  // ========================================
  const [stats, setStats] = useState({
    totalOrders: 156, // Tổng số đơn hàng
    pendingOrders: 23, // Đơn hàng chờ xử lý
    completedOrders: 133, // Đơn hàng đã hoàn thành
    totalRevenue: 2500000000, // Tổng doanh thu (VND)
  });

  // Mock data cho đơn hàng - bao gồm trạng thái và mức độ ưu tiên
  const [orders, setOrders] = useState([
    {
      id: 1,
      customer: "Nguyễn Văn A",
      product: "Pin Lithium-ion 48V 20Ah",
      amount: 2500000,
      status: "pending", // pending, processing, completed, cancelled
      date: "2024-01-20",
      priority: "high", // high, medium, low
    },
    {
      id: 2,
      customer: "Trần Thị B",
      product: "Xe điện VinFast Klara S",
      amount: 15000000,
      status: "processing",
      date: "2024-01-22",
      priority: "medium",
    },
    {
      id: 3,
      customer: "Lê Văn C",
      product: "Pin sắt phosphate 60V 30Ah",
      amount: 3200000,
      status: "completed",
      date: "2024-01-25",
      priority: "low",
    },
  ]);

  // Mock data cho khách hàng - thông tin cơ bản và thống kê
  const [customers, setCustomers] = useState([
    {
      id: 1,
      name: "Nguyễn Văn A",
      email: "nguyenvana@email.com",
      phone: "0123456789",
      status: "active", // active, inactive
      joinDate: "2024-01-15",
      totalOrders: 5, // Tổng số đơn hàng đã mua
    },
    {
      id: 2,
      name: "Trần Thị B",
      email: "tranthib@email.com",
      phone: "0987654321",
      status: "active",
      joinDate: "2024-01-20",
      totalOrders: 3,
    },
  ]);

  // AUTHENTICATION & AUTHORIZATION
  useEffect(() => {
    // Kiểm tra nếu không có user -> redirect về login
    if (!user) {
      setIsCheckingAuth(true);
      const timer = setTimeout(() => {
        if (!user) {
          navigate("/login");
        }
      }, 1000);
      return () => clearTimeout(timer);
    }

    setIsCheckingAuth(false);

    // Xác định role của user từ các cấu trúc khác nhau
    let userRole = null;
    if (user.user && user.user.role) {
      userRole = user.user.role;
    } else if (user.role) {
      userRole = user.role;
    }

    // Kiểm tra quyền truy cập - chỉ cho phép ROLE_STAFF hoặc staff
    if (userRole !== "ROLE_STAFF" && userRole !== "staff") {
      navigate("/");
      toast.error("Bạn không có quyền truy cập trang staff!");
      return;
    }
  }, [user, navigate]);

  //UTILITY FUNCTIONS - Các hàm tiện ích

  // Format tiền tệ theo định dạng Việt Nam
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Lấy màu sắc cho trạng thái (status)
  const getStatusColor = (status) => {
    switch (status) {
      case "active":
      case "completed":
        return "#28a745"; // Xanh lá - Hoạt động/Hoàn thành
      case "pending":
        return "#ffc107"; // Vàng - Chờ xử lý
      case "processing":
        return "#17a2b8"; // Xanh dương - Đang xử lý
      case "cancelled":
        return "#dc3545"; // Đỏ - Đã hủy
      default:
        return "#6c757d"; // Xám - Mặc định
    }
  };

  // Lấy text hiển thị cho trạng thái
  const getStatusText = (status) => {
    switch (status) {
      case "active":
        return "Hoạt động";
      case "pending":
        return "Chờ xử lý";
      case "processing":
        return "Đang xử lý";
      case "completed":
        return "Hoàn thành";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  // Lấy màu sắc cho mức độ ưu tiên (priority)
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "#dc3545"; // Đỏ - Ưu tiên cao
      case "medium":
        return "#ffc107"; // Vàng - Ưu tiên trung bình
      case "low":
        return "#28a745"; // Xanh lá - Ưu tiên thấp
      default:
        return "#6c757d"; // Xám - Mặc định
    }
  };

  // ========================================
  // RENDER LOGIC - Logic hiển thị
  // ========================================

  // Hiển thị loading spinner khi đang kiểm tra authentication
  if (isCheckingAuth) {
    return (
      <div className="staff-loading">
        <div style={{ textAlign: "center" }}>
          <div className="staff-loading-spinner"></div>
          <p className="staff-loading-text">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  // Không render gì nếu không có user
  if (!user) {
    return null;
  }

  // MAIN RENDER - Giao diện chính
  return (
    <div className="staff-page">
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
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
      {/* LAYOUT STRUCTURE - Cấu trúc layout */}
      <div style={{ display: "flex" }}>
        {/*SIDEBAR - Thanh điều hướng bên trái */}

        <StaffSidebar
          user={user}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("userData");
            toast.success("Đăng xuất thành công!");
            setTimeout(() => {
              navigate("/login");
            }, 1000);
          }}
        />
        {/*MAIN CONTENT - Nội dung chính */}

        <div className="staff-main-content">
          <StaffHeader
            activeTab={activeTab}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          {/*DASHBOARD TAB - Tab tổng quan */}
          {activeTab === "dashboard" && (
            <DashboardTab
              stats={stats}
              orders={orders}
              formatCurrency={formatCurrency}
              getStatusColor={getStatusColor}
              getStatusText={getStatusText}
              getPriorityColor={getPriorityColor}
            />
          )}
          {/*ORDERS TAB - Tab quản lý đơn hàng */}
          {activeTab === "orders" && (
            <div className="staff-card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "2rem",
                }}
              >
                <h3>Danh sách đơn hàng</h3>
                <div style={{ display: "flex", gap: "1rem" }}>
                  <button className="staff-btn staff-btn-secondary">
                    <Filter size={16} />
                    Lọc
                  </button>
                  <button className="staff-btn staff-btn-primary">
                    <Download size={16} />
                    Xuất báo cáo
                  </button>
                </div>
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
                        Ưu tiên
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
                        <td style={{ padding: "1rem" }}>
                          <span
                            style={{
                              padding: "0.25rem 0.75rem",
                              borderRadius: "15px",
                              fontSize: "0.8rem",
                              backgroundColor:
                                getPriorityColor(order.priority) + "20",
                              color: getPriorityColor(order.priority),
                            }}
                          >
                            {order.priority === "high" && "Cao"}
                            {order.priority === "medium" && "Trung bình"}
                            {order.priority === "low" && "Thấp"}
                          </span>
                        </td>
                        <td style={{ padding: "1rem" }}>{order.date}</td>
                        <td style={{ padding: "1rem" }}>
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button
                              className="staff-action-btn"
                              title="Xem chi tiết"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              className="staff-action-btn"
                              title="Cập nhật trạng thái"
                            >
                              <Edit size={16} />
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

          {/* CUSTOMERS TAB - Tab quản lý khách hàng */}
          {activeTab === "customers" && (
            <div className="staff-card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "2rem",
                }}
              >
                <h3>Danh sách khách hàng</h3>
                <button className="staff-btn staff-btn-primary">
                  <UserCheck size={16} />
                  Thêm khách hàng
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
                        Tổng đơn hàng
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
                    {customers.map((customer) => (
                      <tr
                        key={customer.id}
                        style={{ borderBottom: "1px solid #e9ecef" }}
                      >
                        <td style={{ padding: "1rem" }}>#{customer.id}</td>
                        <td style={{ padding: "1rem" }}>{customer.name}</td>
                        <td style={{ padding: "1rem" }}>{customer.email}</td>
                        <td style={{ padding: "1rem" }}>{customer.phone}</td>
                        <td style={{ padding: "1rem" }}>
                          <span
                            style={{
                              padding: "0.25rem 0.75rem",
                              borderRadius: "15px",
                              fontSize: "0.8rem",
                              backgroundColor:
                                getStatusColor(customer.status) + "20",
                              color: getStatusColor(customer.status),
                            }}
                          >
                            {getStatusText(customer.status)}
                          </span>
                        </td>
                        <td style={{ padding: "1rem" }}>
                          {customer.totalOrders}
                        </td>
                        <td style={{ padding: "1rem" }}>{customer.joinDate}</td>
                        <td style={{ padding: "1rem" }}>
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button
                              className="staff-action-btn"
                              title="Xem chi tiết"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              className="staff-action-btn"
                              title="Chỉnh sửa"
                            >
                              <Edit size={16} />
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

          {/*PRODUCTS TAB - Tab quản lý sản phẩm */}
          {activeTab === "products" && (
            <div className="staff-card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "2rem",
                }}
              >
                <h3>Danh sách sản phẩm</h3>
                <button className="staff-btn staff-btn-primary">
                  <Plus size={16} />
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
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: "1px solid #e9ecef" }}>
                      <td style={{ padding: "1rem" }}>#1</td>
                      <td style={{ padding: "1rem" }}>
                        Pin Lithium-ion 48V 20Ah
                      </td>
                      <td style={{ padding: "1rem" }}>
                        {formatCurrency(2500000)}
                      </td>
                      <td style={{ padding: "1rem" }}>Pin</td>
                      <td style={{ padding: "1rem" }}>15</td>
                      <td style={{ padding: "1rem" }}>
                        <span
                          style={{
                            padding: "0.25rem 0.75rem",
                            borderRadius: "15px",
                            fontSize: "0.8rem",
                            backgroundColor: "#28a74520",
                            color: "#28a745",
                          }}
                        >
                          Hoạt động
                        </span>
                      </td>
                      <td style={{ padding: "1rem" }}>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button
                            className="staff-action-btn"
                            title="Xem chi tiết"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="staff-action-btn"
                            title="Chỉnh sửa"
                          >
                            <Edit size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffPage;
