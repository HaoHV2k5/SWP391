import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import DashboardTab from "../components/staff/DashboardTab";
import OrdersTab from "../components/staff/OrdersTab";
import CustomersTab from "../components/staff/CustomersTab";
import ProductsTab from "../components/staff/ProductsTab";
import "../styles/staff/index.css";
import { Layout, Menu, Breadcrumb, Avatar, Dropdown, Space, theme } from "antd";
import {
  PieChartOutlined,
  AppstoreOutlined,
  TeamOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";

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
  const [activeTab, setActiveTab] = useState("products"); // Tab hiện tại: products, kyc, dashboard
  const [searchQuery, setSearchQuery] = useState(""); // Từ khóa tìm kiếm
  const [loading, setLoading] = useState(false); // Loading state cho các operations
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); // Kiểm tra authentication

  // ========================================
  // MOCK DATA - Dữ liệu giả lập để demo
  // ========================================
  const [stats, setStats] = useState({
    totalProducts: 45, // Tổng số sản phẩm
    pendingProducts: 12, // Sản phẩm chờ duyệt
    approvedProducts: 28, // Sản phẩm đã duyệt
    rejectedProducts: 5, // Sản phẩm bị từ chối
    totalKyc: 23, // Tổng số KYC
    pendingKyc: 8, // KYC chờ duyệt
    approvedKyc: 15, // KYC đã duyệt
  });

  // Mock data cho sản phẩm chờ duyệt
  const [products, setProducts] = useState([
    {
      id: 1,
      title: "Pin Lithium-ion 48V 20Ah",
      seller: "Nguyễn Văn A",
      price: 2500000,
      status: "PENDING", // PENDING, STAFF_APPROVED, ADMIN_APPROVED, REJECTED
      category: "Pin xe điện",
      description: "Pin lithium-ion chất lượng cao cho xe điện",
      images: ["pin1.jpg", "pin2.jpg"],
      createdAt: "2024-01-20",
      reason: "", // Lý do từ chối nếu có
    },
    {
      id: 2,
      title: "Xe điện VinFast Klara S",
      seller: "Trần Thị B",
      price: 15000000,
      status: "PENDING",
      category: "Xe điện",
      description: "Xe điện VinFast Klara S mới 100%",
      images: ["xe1.jpg", "xe2.jpg"],
      createdAt: "2024-01-22",
      reason: "",
    },
    {
      id: 3,
      title: "Pin sắt phosphate 60V 30Ah",
      seller: "Lê Văn C",
      price: 3200000,
      status: "STAFF_APPROVED",
      category: "Pin xe điện",
      description: "Pin sắt phosphate bền bỉ",
      images: ["pin3.jpg"],
      createdAt: "2024-01-25",
      reason: "",
    },
  ]);

  // Mock data cho KYC chờ duyệt
  const [kycList, setKycList] = useState([
    {
      id: 1,
      userId: 101,
      fullName: "Nguyễn Văn A",
      email: "nguyenvana@email.com",
      phone: "0123456789",
      status: "PENDING", // PENDING, STAFF_APPROVED, ADMIN_APPROVED, REJECTED
      frontImage: "cccd_front.jpg",
      backImage: "cccd_back.jpg",
      submittedAt: "2024-01-20",
      reason: "", // Lý do từ chối nếu có
    },
    {
      id: 2,
      userId: 102,
      fullName: "Trần Thị B",
      email: "tranthib@email.com",
      phone: "0987654321",
      status: "PENDING",
      frontImage: "cccd_front2.jpg",
      backImage: "cccd_back2.jpg",
      submittedAt: "2024-01-22",
      reason: "",
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
      case "PENDING":
        return "#ffc107"; // Vàng - Chờ duyệt
      case "STAFF_APPROVED":
        return "#17a2b8"; // Xanh dương - Staff đã duyệt
      case "ADMIN_APPROVED":
        return "#28a745"; // Xanh lá - Admin đã duyệt
      case "REJECTED":
        return "#dc3545"; // Đỏ - Đã từ chối
      default:
        return "#6c757d"; // Xám - Mặc định
    }
  };

  // Lấy text hiển thị cho trạng thái
  const getStatusText = (status) => {
    switch (status) {
      case "PENDING":
        return "Chờ duyệt";
      case "STAFF_APPROVED":
        return "Staff đã duyệt";
      case "ADMIN_APPROVED":
        return "Admin đã duyệt";
      case "REJECTED":
        return "Đã từ chối";
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
    getItem("Tin Đăng", "products", <AppstoreOutlined />),
    getItem("KYC", "kyc", <TeamOutlined />),
    getItem("Tổng quan", "dashboard", <PieChartOutlined />),
  ];

  const dropdownItems = {
    items: [
      { key: "profile", label: "Hồ sơ", icon: <UserOutlined /> },
      {
        key: "logout",
        label: (
          <button
            onClick={onLogout}
            style={{
              background: "transparent",
              border: 0,
              color: "#044107ff",
              cursor: "pointer",
            }}
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
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(v) => setCollapsed(v)}
      >
        <div className="demo-logo-vertical" />
        <Menu
          theme="dark"
          mode="inline"
          items={items}
          selectedKeys={[activeTab]}
          onClick={(e) => setActiveTab(e.key)}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: "0 24px", background: colorBgContainer }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              height: "100%",
            }}
          >
            <div style={{ fontWeight: 800 }}>
              {activeTab === "products" && " Duyệt Tin Đăng"}
              {activeTab === "kyc" && "Duyệt KYC"}
              {activeTab === "dashboard" && "Tổng quan"}
            </div>
            <Dropdown menu={dropdownItems} trigger={["click"]}>
              <a onClick={(e) => e.preventDefault()}>
                <Space>
                  <Avatar icon={<UserOutlined />} />
                  <span>
                    {user?.user?.fullName || user?.fullname || "Staff"}
                  </span>
                </Space>
              </a>
            </Dropdown>
          </div>
        </Header>
        <Content style={{ margin: "0 16px" }}>
          <Breadcrumb
            style={{ margin: "16px 0" }}
            items={[
              { title: "Staff" },
              { title: items.find((i) => i.key === activeTab)?.label },
            ]}
          />
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            {activeTab === "products" && (
              <ProductsTab
                products={products}
                setProducts={setProducts}
                formatCurrency={formatCurrency}
                getStatusColor={getStatusColor}
                getStatusText={getStatusText}
                loading={loading}
                setLoading={setLoading}
              />
            )}
            {activeTab === "kyc" && (
              <CustomersTab
                kycList={kycList}
                setKycList={setKycList}
                getStatusColor={getStatusColor}
                getStatusText={getStatusText}
                loading={loading}
                setLoading={setLoading}
              />
            )}
            {activeTab === "dashboard" && (
              <DashboardTab
                stats={stats}
                products={products}
                kycList={kycList}
                formatCurrency={formatCurrency}
                getStatusColor={getStatusColor}
                getStatusText={getStatusText}
              />
            )}
          </div>
        </Content>
        <Footer style={{ textAlign: "center" }}>
          Staff Console ©{new Date().getFullYear()}
        </Footer>
      </Layout>
    </Layout>
  );
};

export default StaffPage;
