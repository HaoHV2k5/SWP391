import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout, Menu, Breadcrumb, Avatar, Dropdown, Space, theme } from "antd";
import {
  PieChartOutlined,
  AppstoreOutlined,
  TeamOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";

// Import custom hooks and utilities
import { useProducts, useKyc, useStats, useStaffAuth } from "../hooks/useStaff";
import {
  formatCurrency,
  getStatusColor,
  getStatusText,
} from "../utils/staffUtils";
import { TAB_KEYS } from "../constants/staffConstants";
import { getToastDefaults } from "../utils/notificationManager";

// Import components
import DashboardTab from "../components/staff/DashboardTab";
import CustomersTab from "../components/staff/CustomersTab";
import ProductsTab from "../components/staff/ProductsTab";
import "../styles/staff/index.css";

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

  // Get toast defaults (cấu hình sẽ được thực hiện trong ToastContainer)
  const toastDefaults = getToastDefaults();

  // ========================================
  // STATE MANAGEMENT - Sử dụng custom hooks
  // ========================================
  const [activeTab, setActiveTab] = useState(TAB_KEYS.PRODUCTS);

  // Custom hooks for data management
  const productsHook = useProducts();
  const kycHook = useKyc();
  const statsHook = useStats();
  const { isCheckingAuth } = useStaffAuth(user, navigate);

  // ========================================
  // MENU CONFIGURATION
  // ========================================
  const menuItems = [
    getItem("Tin Đăng", TAB_KEYS.PRODUCTS, <AppstoreOutlined />),
    getItem("KYC", TAB_KEYS.KYC, <TeamOutlined />),
    getItem("Tổng quan", TAB_KEYS.DASHBOARD, <PieChartOutlined />),
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

  // ========================================
  // RENDER LOGIC
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

  // Get header title based on active tab
  const getHeaderTitle = () => {
    switch (activeTab) {
      case TAB_KEYS.PRODUCTS:
        return "Duyệt Tin Đăng";
      case TAB_KEYS.KYC:
        return "Duyệt KYC";
      case TAB_KEYS.DASHBOARD:
        return "Tổng quan";
      default:
        return "Staff Console";
    }
  };

  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case TAB_KEYS.PRODUCTS:
        return (
          <ProductsTab
            products={productsHook.products}
            setProducts={productsHook.setProducts}
            formatCurrency={formatCurrency}
            getStatusColor={getStatusColor}
            getStatusText={getStatusText}
            loading={productsHook.loading}
            setLoading={() => {}} // Not needed with custom hook
          />
        );

      case TAB_KEYS.KYC:
        return (
          <CustomersTab
            kycList={kycHook.kycList}
            setKycList={kycHook.setKycList}
            getStatusColor={getStatusColor}
            getStatusText={getStatusText}
            loading={kycHook.loading}
            setLoading={() => {}} // Not needed with custom hook
          />
        );

      case TAB_KEYS.DASHBOARD:
        return (
          <DashboardTab
            stats={statsHook.stats}
            products={productsHook.products}
            kycList={kycHook.kycList}
            formatCurrency={formatCurrency}
            getStatusColor={getStatusColor}
            getStatusText={getStatusText}
          />
        );

      default:
        return <div>Tab không tồn tại</div>;
    }
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
          items={menuItems}
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
            <div style={{ fontWeight: 800 }}>{getHeaderTitle()}</div>
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
              { title: menuItems.find((i) => i.key === activeTab)?.label },
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
            {renderTabContent()}
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
