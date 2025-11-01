// src/pages/StaffPage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Layout,
  Menu,
  Breadcrumb,
  Avatar,
  Dropdown,
  Space,
  theme,
  Button,
} from "antd";
import {
  PieChartOutlined,
  AppstoreOutlined,
  TeamOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useProducts, useKyc, useStats, useStaffAuth } from "../hooks/useStaff";
import { TAB_KEYS } from "../constants/staffConstants";
import ProductsTab from "../components/staff/ProductsTab";
import KYCTab from "../components/staff/KYCTab";
import ComplaintTab from "../components/staff/ComplaintTab";
import DashboardTab from "../components/staff/DashboardTab";
import UserProfileButton from "../components/staff/common/UserProfileButton";
import "../styles/staff/index.css";

const { Header, Content, Footer, Sider } = Layout;
const getItem = (label, key, icon) => ({ key, icon, label });

const StaffPage = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState(TAB_KEYS.PRODUCTS);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const productsHook = useProducts();
  const kycHook = useKyc();
  const statsHook = useStats();
  const { isCheckingAuth } = useStaffAuth(user); //KHÔNG truyền navigate ở đây

  useEffect(() => {
    // dùng reload(), không phải loadStats()
    statsHook.reload?.();
  }, [statsHook]);

  const menuItems = [
    getItem("Tổng quan", TAB_KEYS.DASHBOARD, <PieChartOutlined />),
    getItem("Quản Lý Tin đăng", TAB_KEYS.PRODUCTS, <AppstoreOutlined />),
    getItem("Quản Lý KYC", TAB_KEYS.KYC, <TeamOutlined />),
    getItem(
      "Quản Lý Khiếu nại",
      TAB_KEYS.COMPLAINTS,
      <ExclamationCircleOutlined />
    ),
  ]; 

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
  if (!user) return null;

  const titles = {
    [TAB_KEYS.DASHBOARD]: "Tổng Quan",
    [TAB_KEYS.PRODUCTS]: "Duyệt Tin Đăng",
    [TAB_KEYS.KYC]: "Duyệt Hồ Sơ KYC",
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
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
            <div style={{ fontWeight: 800 }}>
              {titles[activeTab] || "Staff Console"}
            </div>
            <Space>
              {/* Nút mở Drawer cập nhật tài khoản */}
              <UserProfileButton
                displayName={user?.user?.fullName || user?.fullname || "Staff"}
              />{" "}
              {/* Nút đăng xuất giữ nguyên logic onLogout đã có */}{" "}
              <Button onClick={onLogout}>Đăng xuất</Button>{" "}
            </Space>
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
            {activeTab === TAB_KEYS.PRODUCTS && <ProductsTab />}
            {activeTab === TAB_KEYS.KYC && <KYCTab />}
            {activeTab === TAB_KEYS.COMPLAINTS && <ComplaintTab />}
            {activeTab === TAB_KEYS.DASHBOARD && (
              <DashboardTab
                stats={statsHook.stats}
                products={productsHook.products}
                kycList={kycHook.kycList}
                complaints={[]}
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
