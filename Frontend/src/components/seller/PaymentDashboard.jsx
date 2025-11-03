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
    fetchStats(true); // Initial load với loading
    
    // Listen for wallet reload events từ các components con
    const handleWalletReload = () => {
      console.log("🔄 PaymentDashboard: Received wallet.reload event, refreshing stats...");
      // Polling để đợi transaction mới xuất hiện (tối đa 5s, mỗi 500ms check 1 lần)
      let attempts = 0;
      const maxAttempts = 10;
      
      const pollStats = async () => {
        attempts++;
        console.log(`🔄 PaymentDashboard: Polling attempt ${attempts}/${maxAttempts}`);
        
        try {
          await fetchStats(false); // Không show loading khi auto-refresh
          
          // Nếu đã fetch được rồi, không cần poll nữa
          if (attempts >= 3) {
            console.log("🔄 PaymentDashboard: Finished polling after 3 attempts");
            return; // Đã fetch 3 lần, đủ rồi
          }
        } catch (error) {
          console.error("Error polling stats:", error);
        }
        
        // Nếu chưa đủ attempts, tiếp tục poll
        if (attempts < maxAttempts) {
          setTimeout(pollStats, 500);
        }
      };
      
      // Bắt đầu poll ngay
      pollStats();
    };
    
    // Listen for sessionStorage flag (check mỗi 500ms để nhanh hơn)
    const checkStorage = setInterval(() => {
      if (sessionStorage.getItem("wallet.reload") === "1") {
        sessionStorage.removeItem("wallet.reload");
        console.log("🔄 PaymentDashboard: Found wallet.reload flag in sessionStorage");
        handleWalletReload();
      }
    }, 500);
    
    window.addEventListener('wallet.reload', handleWalletReload);
    
    return () => {
      clearInterval(checkStorage);
      window.removeEventListener('wallet.reload', handleWalletReload);
    };
  }, []);

  const fetchStats = async (showLoading = false) => {
    try {
      // Chỉ show loading spinner khi cần (không show khi auto-refresh)
      if (showLoading) {
        setLoading(true);
      }
      
      const [currentRes, walletRes, packageRes] = await Promise.all([
        paymentService.getCurrentPackage().catch(() => ({ data: null })),
        paymentService.getWalletTransactions().catch(() => ({ data: [] })),
        paymentService.getPackageHistory().catch(() => ({ data: [] })),
      ]);

      // Tính số dư ví: ưu tiên dùng balanceAfter của transaction COMPLETED cuối cùng
      const walletTransactions = walletRes.data || [];
      
      console.log("🔍 PaymentDashboard - Transactions:", walletTransactions);
      
      const completedTx = walletTransactions
        .filter(tx => {
          const status = (tx?.status || "").toUpperCase();
          return status === "COMPLETED";
        })
        .sort((a, b) => {
          const dateA = new Date(a?.completedAt || a?.createdAt || 0);
          const dateB = new Date(b?.completedAt || b?.createdAt || 0);
          return dateB - dateA;
        });
      
      console.log("✅ COMPLETED transactions:", completedTx);
      
      let walletBalance = 0;
      if (completedTx.length > 0) {
        const latestTx = completedTx[0];
        console.log("💰 Latest COMPLETED tx:", {
          id: latestTx?.id,
          transactionCode: latestTx?.transactionCode,
          balanceAfter: latestTx?.balanceAfter,
          amount: latestTx?.amount,
          type: latestTx?.typeWalletTraction || latestTx?.type,
          status: latestTx?.status,
          completedAt: latestTx?.completedAt
        });
        
        // Nếu có balanceAfter, dùng nó (chính xác nhất)
        if (latestTx?.balanceAfter != null && latestTx.balanceAfter !== undefined) {
          walletBalance = Number(latestTx.balanceAfter) || 0;
          console.log("💰 PaymentDashboard: Using balanceAfter from latest COMPLETED tx =", walletBalance);
        } else {
          // Tính toán CHỈ từ các transaction COMPLETED
          // CHỈ tính COMPLETED - đảm bảo số dư chính xác (không tính PENDING để tránh hiển thị sai khi giao dịch thất bại)
          walletBalance = walletTransactions.reduce((sum, tx) => {
            const status = (tx?.status || "").toUpperCase();
            
            // CHỈ tính COMPLETED transactions
            if (status === "COMPLETED") {
              const type = ((tx?.typeWalletTraction || tx?.type || "") + "").toUpperCase();
              const amount = Number(tx?.amount || 0);
              
              // Nạp tiền, hoàn tiền, refund → cộng vào
              if (
                type === "RECHARGE" ||
                type.includes("RECHARGE") ||
                type.includes("REFUND") ||
                type.includes("DEPOSIT") ||
                type.includes("NẠP")
              ) {
                return sum + amount;
              }
              // Các loại chi (mua gói, mua sản phẩm, rút tiền) → trừ đi
              if (
                type === "PAYMENT_PACKAGE" ||
                type === "PAYMENT_PRODUCT" ||
                type === "WITHDRAWAL" ||
                type.includes("BUY") ||
                type.includes("PAYMENT") ||
                type.includes("WITHDRAWAL") ||
                type.includes("MUA") ||
                type.includes("RÚT")
              ) {
                return sum - amount;
              }
            }
            return sum;
          }, 0);
          console.log("💰 Calculated balance from COMPLETED:", walletBalance);
        }
      } else {
        console.warn("⚠️ No COMPLETED transactions found! Balance will be 0.");
        walletBalance = 0;
      }

      const newStats = {
        currentPackage: currentRes.data,
        walletBalance: walletBalance > 0 ? walletBalance : 0,
        totalTransactions: walletTransactions.length || 0,
        totalPackages: packageRes.data?.length || 0,
      };
      
      console.log("💰 PaymentDashboard: Updating stats with balance =", newStats.walletBalance);
      setStats(newStats);
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
