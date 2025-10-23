// src/components/seller/PaymentDashboard.jsx
import React, { useState } from "react";
import { Card, Tabs, Row, Col, Statistic, Spin, message } from "antd";
import {
  WalletOutlined,
  ShoppingCartOutlined,
  HistoryOutlined,
  DollarOutlined,
  GiftOutlined,
} from "@ant-design/icons";
import PackagesList from "./PackagesList";
import WalletManagement from "./WalletManagement";
import { paymentService } from "../../services/paymentService";

const PaymentDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState("packages");
  const [stats, setStats] = useState({
    currentPackage: null,
    walletBalance: 0,
    totalTransactions: 0,
    totalPackages: 0,
  });
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [currentRes, walletRes, packageRes] = await Promise.all([
        paymentService.getCurrentPackage().catch(() => ({ data: null })),
        paymentService.getWalletTransactions().catch(() => ({ data: [] })),
        paymentService.getPackageHistory().catch(() => ({ data: [] })),
      ]);

      setStats({
        currentPackage: currentRes.data,
        walletBalance:
          walletRes.data?.reduce((sum, tx) => {
            if (tx.type?.toLowerCase().includes("recharge")) {
              return sum + (tx.amount || 0);
            } else if (tx.type?.toLowerCase().includes("buy")) {
              return sum - (tx.amount || 0);
            }
            return sum;
          }, 0) || 0,
        totalTransactions: walletRes.data?.length || 0,
        totalPackages: packageRes.data?.length || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      message.error("Không thể tải thống kê. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const tabItems = [
    {
      key: "packages",
      label: (
        <span>
          <GiftOutlined />
          Gói Dịch Vụ
        </span>
      ),
      children: <PackagesList user={user} />,
    },
    {
      key: "wallet",
      label: (
        <span>
          <WalletOutlined />
          Quản Lý Ví
        </span>
      ),
      children: <WalletManagement user={user} />,
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
        <p>Đang tải dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ margin: 0, fontSize: "28px", fontWeight: "bold" }}>
          <DollarOutlined style={{ marginRight: "12px", color: "#1890ff" }} />
          Payment Dashboard
        </h1>
        <p style={{ color: "#666", margin: "8px 0 0 0", fontSize: "16px" }}>
          Quản lý gói dịch vụ và ví của bạn
        </p>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Số dư ví"
              value={stats.walletBalance}
              formatter={(value) => formatPrice(value)}
              prefix={<WalletOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Gói hiện tại"
              value={
                stats.currentPackage ? stats.currentPackage.name : "Chưa có"
              }
              prefix={<GiftOutlined style={{ color: "#1890ff" }} />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng giao dịch"
              value={stats.totalTransactions}
              prefix={<HistoryOutlined style={{ color: "#722ed1" }} />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Gói đã mua"
              value={stats.totalPackages}
              prefix={<ShoppingCartOutlined style={{ color: "#fa8c16" }} />}
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Current Package Info */}
      {stats.currentPackage && (
        <Card
          style={{
            marginBottom: "24px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            border: "none",
          }}
        >
          <Row gutter={16} align="middle">
            <Col span={16}>
              <h3 style={{ color: "white", margin: 0, fontSize: "20px" }}>
                <GiftOutlined style={{ marginRight: "8px" }} />
                Gói đang sử dụng: {stats.currentPackage.name}
              </h3>
              <p
                style={{ color: "rgba(255,255,255,0.8)", margin: "8px 0 0 0" }}
              >
                Còn lại: {stats.currentPackage.postPossible} bài đăng | Hết hạn:{" "}
                {new Date(stats.currentPackage.endTime).toLocaleDateString(
                  "vi-VN"
                )}
              </p>
            </Col>
            <Col span={8} style={{ textAlign: "right" }}>
              <div
                style={{
                  background: "rgba(255,255,255,0.1)",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  display: "inline-block",
                }}
              >
                <div style={{ fontSize: "14px", opacity: 0.8 }}>Giá gói</div>
                <div style={{ fontSize: "18px", fontWeight: "bold" }}>
                  {formatPrice(stats.currentPackage.price)}
                </div>
              </div>
            </Col>
          </Row>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          size="large"
        />
      </Card>
    </div>
  );
};

export default PaymentDashboard;
