import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import DashboardTab from "../components/staff/DashboardTab";
import OrdersTab from "../components/staff/OrdersTab";
import CustomersTab from "../components/staff/CustomersTab";
import ProductsTab from "../components/staff/ProductsTab";
import "../styles/staff/index.css";
import { Layout, Menu, Breadcrumb, Avatar, Dropdown, Space, theme } from "antd";
import { PieChartOutlined, AppstoreOutlined, TeamOutlined, UserOutlined, LogoutOutlined } from "@ant-design/icons";

const { Header, Content, Footer, Sider } = Layout;

function getItem(label, key, icon) {
  return { key, icon, label };
}

const StaffPage = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

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

  // MAIN RENDER - Giao diện chính (Ant Design)
  const items = [
    getItem("Tổng quan", "dashboard", <PieChartOutlined />),
    getItem("Đơn hàng", "orders", <AppstoreOutlined />),
    getItem("Khách hàng", "customers", <TeamOutlined />),
    getItem("Sản phẩm", "products", <AppstoreOutlined />),
  ];

  const dropdownItems = {
    items: [
      { key: "profile", label: "Hồ sơ", icon: <UserOutlined /> },
      {
        key: "logout",
        label: (
          <button
            onClick={onLogout}
            style={{ background: "transparent", border: 0, color: "#ef4444", cursor: "pointer" }}
          >
            Đăng xuất
          </button>
        ),
        icon: <LogoutOutlined />,
        danger: true,
      },
    ],
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider collapsible collapsed={collapsed} onCollapse={(v) => setCollapsed(v)}>
        <div className="demo-logo-vertical" />
        <Menu theme="dark" mode="inline" items={items} selectedKeys={[activeTab]} onClick={(e) => setActiveTab(e.key)} />
      </Sider>
      <Layout>
        <Header style={{ padding: "0 24px", background: colorBgContainer }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: "100%" }}>
            <div style={{ fontWeight: 800 }}>
              {activeTab === "dashboard" && "📊 Tổng quan"}
              {activeTab === "orders" && "📋 Quản lý đơn hàng"}
              {activeTab === "customers" && "👥 Quản lý khách hàng"}
              {activeTab === "products" && "📦 Quản lý sản phẩm"}
            </div>
            <Dropdown menu={dropdownItems} trigger={["click"]}>
              <a onClick={(e) => e.preventDefault()}>
                <Space>
                  <Avatar icon={<UserOutlined />} />
                  <span>{user?.user?.fullName || user?.fullname || "Staff"}</span>
                </Space>
              </a>
            </Dropdown>
          </div>
        </Header>
        <Content style={{ margin: "0 16px" }}>
          <Breadcrumb style={{ margin: "16px 0" }} items={[{ title: "Staff" }, { title: items.find(i => i.key === activeTab)?.label }]} />
          <div style={{ padding: 24, minHeight: 360, background: colorBgContainer, borderRadius: borderRadiusLG }}>
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
          {activeTab === "orders" && (
              <OrdersTab
                orders={orders}
                formatCurrency={formatCurrency}
                getStatusColor={getStatusColor}
                getStatusText={getStatusText}
                getPriorityColor={getPriorityColor}
              />
            )}
          {activeTab === "customers" && (
              <CustomersTab
                customers={customers}
                getStatusColor={getStatusColor}
                getStatusText={getStatusText}
              />
            )}
            {activeTab === "products" && <ProductsTab formatCurrency={formatCurrency} />}
              </div>
        </Content>
        <Footer style={{ textAlign: "center" }}>Staff Console ©{new Date().getFullYear()}</Footer>
      </Layout>
    </Layout>
  );
};

export default StaffPage;
