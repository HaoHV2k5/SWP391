// src/components/seller/PackagesList.jsx
import React, { useState, useEffect } from "react";
import { Card, Row, Col, Button, Tag, Spin, message, Modal } from "antd";
import {
  CrownOutlined,
  StarOutlined,
  ThunderboltOutlined,
  CalendarOutlined,
  FileTextOutlined,
  WalletOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { paymentService } from "../../services/paymentService";

const PackagesList = ({ user }) => {
  const [packages, setPackages] = useState([]);
  const [currentPackage, setCurrentPackage] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [buyingPackage, setBuyingPackage] = useState(null);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [checkingBalance, setCheckingBalance] = useState(false);

  // Hàm map package từ API sang format UI
  const mapPackageToUI = (pkg) => {
    // Xác định icon, color, features dựa trên tên gói
    let icon = <FileTextOutlined />;
    let color = "#52c41a";
    let features = [];
    const name = pkg.name?.toLowerCase() || "";
    
    // Kiểm tra requireApproval từ API hoặc suy luận từ tên gói
    const isRequireApproval = 
      pkg.requireApproval === true || 
      name.includes("kiểm duyệt") || 
      name.includes("kiem duyet") ||
      name.includes("(kèm)") ||
      name.includes("(kem)");

    if (name.includes("premium")) {
      icon = <CrownOutlined />;
      color = "#722ed1";
      features = [
        pkg.postLimit === 9999 ? "Không giới hạn bài đăng" : `${pkg.postLimit} bài đăng`,
        `${pkg.duration} ngày sử dụng`,
        "Hiển thị nổi bật",
        "Hỗ trợ VIP",
        "Tính năng cao cấp"
      ];
    } else if (name.includes("nâng cao") || name.includes("nang cao")) {
      icon = <StarOutlined />;
      color = "#1890ff";
      features = [
        `${pkg.postLimit} bài đăng`,
        `${pkg.duration} ngày sử dụng`,
        "Ưu tiên hiển thị",
        "Hỗ trợ 24/7"
      ];
    } else {
      icon = <FileTextOutlined />;
      color = "#52c41a";
      features = [
        `${pkg.postLimit} bài đăng`,
        `${pkg.duration} ngày sử dụng`,
        "Hỗ trợ cơ bản"
      ];
    }

    // Thêm "Kiểm duyệt bởi admin" nếu requireApproval = true
    if (isRequireApproval) {
      features.push("Kiểm duyệt bởi admin");
    }

    return {
      id: pkg.id,
      name: pkg.name,
      description: pkg.description || "",
      price: pkg.price,
      duration: pkg.duration,
      postLimit: pkg.postLimit,
      requireApproval: isRequireApproval,
      icon: icon,
      color: color,
      features: features
    };
  };

  // Mock data fallback (nếu API fail)
  const mockPackages = [
    {
      id: 4,
      name: "Gói Cơ Bản",
      description: "Đăng tối đa 5 tin trong 30 ngày",
      price: 50000,
      duration: 30,
      postLimit: 5,
      requireApproval: false,
      icon: <FileTextOutlined />,
      color: "#52c41a",
      features: ["5 bài đăng", "30 ngày sử dụng", "Hỗ trợ cơ bản"],
    },
    {
      id: 5,
      name: "Gói Nâng Cao",
      description: "Đăng tối đa 15 tin trong 60 ngày, được ưu tiên hiển thị",
      price: 120000,
      duration: 60,
      postLimit: 15,
      requireApproval: false,
      icon: <StarOutlined />,
      color: "#1890ff",
      features: [
        "15 bài đăng",
        "60 ngày sử dụng",
        "Ưu tiên hiển thị",
        "Hỗ trợ 24/7",
      ],
    },
    {
      id: 6,
      name: "Gói Premium",
      description: "Không giới hạn số tin, thời hạn 90 ngày, hiển thị nổi bật",
      price: 250000,
      duration: 90,
      postLimit: 9999,
      requireApproval: false,
      icon: <CrownOutlined />,
      color: "#722ed1",
      features: [
        "Không giới hạn bài đăng",
        "90 ngày sử dụng",
        "Hiển thị nổi bật",
        "Hỗ trợ VIP",
        "Tính năng cao cấp",
      ],
    },
    {
      id: 7,
      name: "Gói Cơ Bản (Kèm kiểm duyệt)",
      description: "Đăng tối đa 5 tin trong 30 ngày - Kèm kiểm duyệt",
      price: 50000,
      duration: 30,
      postLimit: 5,
      requireApproval: true,
      icon: <FileTextOutlined />,
      color: "#52c41a",
      features: ["5 bài đăng", "30 ngày sử dụng", "Hỗ trợ cơ bản", "Kiểm duyệt bởi admin"],
    },
    {
      id: 8,
      name: "Gói Nâng Cao (Kèm kiểm duyệt)",
      description: "Đăng tối đa 15 tin trong 60 ngày, được ưu tiên hiển thị - Kèm kiểm duyệt",
      price: 120000,
      duration: 60,
      postLimit: 15,
      requireApproval: true,
      icon: <StarOutlined />,
      color: "#1890ff",
      features: [
        "15 bài đăng",
        "60 ngày sử dụng",
        "Ưu tiên hiển thị",
        "Hỗ trợ 24/7",
        "Kiểm duyệt bởi admin",
      ],
    },
    {
      id: 9,
      name: "Gói Premium (Kèm kiểm duyệt)",
      description: "Không giới hạn số tin, thời hạn 90 ngày, hiển thị nổi bật - Kèm kiểm duyệt",
      price: 250000,
      duration: 90,
      postLimit: 9999,
      requireApproval: true,
      icon: <CrownOutlined />,
      color: "#722ed1",
      features: [
        "Không giới hạn bài đăng",
        "90 ngày sử dụng",
        "Hiển thị nổi bật",
        "Hỗ trợ VIP",
        "Tính năng cao cấp",
        "Kiểm duyệt bởi admin",
      ],
    },
  ];

  useEffect(() => {
    fetchPackages();
    fetchCurrentPackage();
    fetchWalletBalance();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await paymentService.getAllPackages();
      
      if (response.success && response.data && response.data.length > 0) {
        // Map packages từ API sang format UI
        const mappedPackages = response.data.map(mapPackageToUI);
        setPackages(mappedPackages);
      } else {
        // Fallback về mock data nếu API fail hoặc không có data
        console.warn("API không trả về data, dùng mock data");
        const mappedMockPackages = mockPackages.map(mapPackageToUI);
        setPackages(mappedMockPackages);
      }
    } catch (error) {
      console.error("Error fetching packages:", error);
      // Fallback về mock data
      const mappedMockPackages = mockPackages.map(mapPackageToUI);
      setPackages(mappedMockPackages);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentPackage = async () => {
    try {
      const response = await paymentService.getCurrentPackage();
      setCurrentPackage(response.data);
    } catch (error) {
      console.log("No current package or error:", error);
      setCurrentPackage(null);
    }
  };

  // Fetch wallet balance từ transactions
  const fetchWalletBalance = async () => {
    try {
      const response = await paymentService.getWalletTransactions();
      const transactions = response?.data || [];
      
      // Tính balance từ COMPLETED transactions
      const balance = transactions.reduce((sum, tx) => {
        const status = (tx?.status || "").toUpperCase();
        
        if (status === "COMPLETED") {
          // Lấy balanceAfter từ transaction cuối cùng (chính xác nhất)
          if (tx?.balanceAfter != null && tx.balanceAfter !== undefined) {
            return Number(tx.balanceAfter);
          }
          
          // Nếu không có balanceAfter, tính từ các transaction
          const type = ((tx?.typeWalletTraction || tx?.type || "") + "").toUpperCase();
          const amount = Number(tx?.amount || 0);
          
          // Nạp tiền → cộng
          if (
            type === "RECHARGE" ||
            type.includes("RECHARGE") ||
            type.includes("REFUND") ||
            type.includes("DEPOSIT") ||
            type.includes("NẠP")
          ) {
            return sum + amount;
          }
          
          // Chi tiêu → trừ
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
      
      // Nếu có transaction COMPLETED có balanceAfter, dùng nó (chính xác hơn)
      const completedTx = transactions
        .filter(tx => (tx?.status || "").toUpperCase() === "COMPLETED" && tx?.balanceAfter != null)
        .sort((a, b) => {
          const dateA = new Date(a?.completedAt || a?.createdAt || 0);
          const dateB = new Date(b?.completedAt || b?.createdAt || 0);
          return dateB - dateA;
        });
      
      if (completedTx.length > 0 && completedTx[0]?.balanceAfter != null) {
        setWalletBalance(Number(completedTx[0].balanceAfter) > 0 ? Number(completedTx[0].balanceAfter) : 0);
      } else {
        setWalletBalance(balance > 0 ? balance : 0);
      }
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
      setWalletBalance(0);
    }
  };

  const handleBuyPackage = async (pkg) => {
    if (!pkg || !user?.id) return;

    try {
      setCheckingBalance(true);

      // 1. Kiểm tra số dư trước
      if (walletBalance < pkg.price) {
        message.error({
          content: `Số dư trong ví không đủ! Bạn cần ${formatPrice(pkg.price)} nhưng chỉ có ${formatPrice(walletBalance)}. Vui lòng nạp thêm tiền vào ví.`,
          duration: 5,
        });
        return;
      }

      // 2. Kiểm tra nếu có gói cũ đang active
      if (currentPackage) {
        const currentEndTime = new Date(currentPackage.endTime);
        const now = new Date();
        
        // Nếu gói cũ còn hạn
        if (currentEndTime > now) {
          // Kiểm tra nếu gói mới rẻ hơn hoặc bằng gói đang dùng
          const currentPackagePrice = packages.find(p => p.name === currentPackage.name)?.price || 0;
          if (pkg.price <= currentPackagePrice) {
            message.warning({
              content: `Bạn đang sử dụng gói "${currentPackage.name}" (${formatPrice(currentPackagePrice)}). Bạn chỉ có thể mua gói có giá cao hơn.`,
              duration: 5,
            });
            return;
          }
        }
      }

      // 3. Nếu đủ điều kiện → hiển thị modal xác nhận
      setSelectedPackage(pkg);
      setConfirmModalVisible(true);
    } catch (error) {
      console.error("Error checking balance:", error);
      message.error("Có lỗi xảy ra. Vui lòng thử lại!");
    } finally {
      setCheckingBalance(false);
    }
  };

  const confirmBuyPackage = async () => {
    if (!selectedPackage || !user?.id) return;

    try {
      setBuyingPackage(selectedPackage.id);
      const response = await paymentService.buyPackage(
        user.id,
        selectedPackage.id
      );

      if (response.data) {
        message.success(response.message || "Mua gói thành công!");
        
        // ⚠️ QUAN TRỌNG: Đợi một chút để BE đã lưu transaction xong
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Refresh data trong PackagesList trước
        await Promise.all([
          fetchCurrentPackage(),
          fetchWalletBalance(),
          fetchPackages(),
        ]);
        
        // Trigger reload cho PaymentDashboard và các components khác
        // Đợi thêm một chút nữa để đảm bảo transaction đã có trong DB
        setTimeout(() => {
          console.log("🔄 PackagesList: Triggering wallet.reload after package purchase");
          sessionStorage.setItem("wallet.reload", "1");
          window.dispatchEvent(new Event('wallet.reload'));
        }, 500);
      } else {
        message.error(response.message || "Mua gói thất bại!");
      }
    } catch (error) {
      console.error("Error buying package:", error);
      
      // Xử lý các error messages từ backend
      const errorData = error?.response?.data;
      const errorMessage = 
        errorData?.message || 
        errorData?.data?.message ||
        error?.message || 
        "";
      
      // Kiểm tra error code
      const errorCode = errorData?.data?.code || errorData?.code;
      
      // Xử lý các error cụ thể
      if (
        errorMessage.toLowerCase().includes("không đủ tiền") ||
        errorMessage.toLowerCase().includes("khong du tien") ||
        errorMessage.toLowerCase().includes("insufficient")
      ) {
        message.error("Số dư trong ví không đủ. Vui lòng nạp thêm tiền!");
      } else if (
        errorMessage.toLowerCase().includes("package_cannot_buy_lower") ||
        errorMessage.toLowerCase().includes("gói rẻ hơn") ||
        errorMessage.toLowerCase().includes("goi re hon")
      ) {
        message.error("Bạn chỉ có thể mua gói có giá cao hơn gói đang sử dụng!");
      } else if (errorMessage) {
        message.error(errorMessage);
      } else {
        message.error("Có lỗi xảy ra khi mua gói. Vui lòng thử lại!");
      }
    } finally {
      setBuyingPackage(null);
      setConfirmModalVisible(false);
      setSelectedPackage(null);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getPackageStatus = (pkg) => {
    if (!currentPackage) return null;

    if (currentPackage.name === pkg.name) {
      return (
        <Tag 
          color="green" 
          style={{ 
            position: "absolute", 
            top: "16px", 
            left: "16px",
            fontSize: "12px",
            fontWeight: "600",
            zIndex: 1
          }}
        >
          Đang sử dụng
        </Tag>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
        <p>Đang tải thông tin gói dịch vụ...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "bold" }}>
              <WalletOutlined style={{ marginRight: "8px", color: "#1890ff" }} />
              Gói Dịch Vụ Đăng Tin
            </h2>
            <p style={{ color: "#666", margin: "8px 0 0 0" }}>
              Chọn gói dịch vụ phù hợp để đăng tin bán hàng hiệu quả
            </p>
          </div>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchPackages}
            loading={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            Làm mới
          </Button>
        </div>
      </div>

      {currentPackage && (
        <Card
          style={{
            marginBottom: "24px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
          }}
          styles={{ body: { padding: "20px" } }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <h3 style={{ color: "white", margin: 0 }}>
                <ThunderboltOutlined style={{ marginRight: "8px" }} />
                Gói hiện tại: {currentPackage.name}
              </h3>
              <p
                style={{ color: "rgba(255,255,255,0.8)", margin: "8px 0 0 0" }}
              >
                Còn lại: {currentPackage.postPossible} bài đăng | Hết hạn:{" "}
                {new Date(currentPackage.endTime).toLocaleDateString("vi-VN")}
              </p>
            </div>
            <Tag color="gold" style={{ fontSize: "14px", padding: "4px 12px" }}>
              Đang hoạt động
            </Tag>
          </div>
        </Card>
      )}

      <Row gutter={[24, 24]} style={{ display: "flex", alignItems: "stretch" }}>
        {packages.map((pkg) => (
          <Col xs={24} sm={12} lg={8} xl={8} key={pkg.id} style={{ display: "flex" }}>
            <Card
              hoverable
              style={{
                height: "100%",
                width: "100%",
                border:
                  currentPackage?.name === pkg.name
                    ? "2px solid #52c41a"
                    : "1px solid #d9d9d9",
                position: "relative",
                display: "flex",
                flexDirection: "column",
              }}
              styles={{ 
                body: { 
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                  height: "100%"
                } 
              }}
            >
              {getPackageStatus(pkg)}
              {pkg.requireApproval && (
                <Tag 
                  color="orange" 
                  style={{ 
                    position: "absolute", 
                    top: "16px", 
                    right: "8px",
                    fontSize: "12px",
                    fontWeight: "600",
                    zIndex: 2
                  }}
                >
                  Cần kiểm duyệt
                </Tag>
              )}

              <div style={{ textAlign: "center", marginBottom: "20px", flexShrink: 0 }}>
                <div
                  style={{
                    fontSize: "48px",
                    color: pkg.color,
                    marginBottom: "12px",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  {pkg.icon}
                </div>
                <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "bold" }}>
                  {pkg.name}
                </h3>
                <p style={{ color: "#666", margin: "8px 0 0 0" }}>
                  {pkg.description}
                </p>
              </div>

              <div style={{ textAlign: "center", marginBottom: "24px", flexShrink: 0 }}>
                <div
                  style={{
                    fontSize: "32px",
                    fontWeight: "bold",
                    color: pkg.color,
                  }}
                >
                  {formatPrice(pkg.price)}
                </div>
                <div style={{ color: "#666", fontSize: "14px" }}>
                  <CalendarOutlined style={{ marginRight: "4px" }} />
                  {pkg.duration} ngày
                </div>
              </div>

              <div style={{ marginBottom: "24px", flex: 1, minHeight: "120px" }}>
                <h4 style={{ marginBottom: "12px", fontSize: "16px" }}>
                  Tính năng:
                </h4>
                <ul style={{ padding: 0, margin: 0, listStyle: "none" }}>
                  {pkg.features.map((feature, index) => (
                    <li
                      key={index}
                      style={{
                        padding: "4px 0",
                        color: "#666",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          color: pkg.color,
                          marginRight: "8px",
                          fontWeight: "bold",
                        }}
                      >
                        ✓
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                type="primary"
                size="large"
                block
                style={{
                  background: pkg.color,
                  borderColor: pkg.color,
                  color: "white",
                  height: "48px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  marginTop: "auto",
                  flexShrink: 0,
                }}
                styles={{
                  label: {
                    color: "white !important"
                  }
                }}
                onClick={() => handleBuyPackage(pkg)}
                loading={buyingPackage === pkg.id || checkingBalance}
                disabled={
                  currentPackage?.name === pkg.name ||
                  walletBalance < pkg.price
                }
              >
                {currentPackage?.name === pkg.name
                  ? "Đang sử dụng"
                  : walletBalance < pkg.price
                  ? "Số dư không đủ"
                  : "Mua ngay"}
              </Button>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Confirmation Modal */}
      <Modal
        title={
          <div>
            <WalletOutlined style={{ marginRight: "8px", color: "#1890ff" }} />
            Xác nhận mua gói
          </div>
        }
        open={confirmModalVisible}
        onOk={confirmBuyPackage}
        onCancel={() => {
          setConfirmModalVisible(false);
          setSelectedPackage(null);
        }}
        okText="Xác nhận mua"
        cancelText="Hủy"
        okButtonProps={{
          loading: buyingPackage === selectedPackage?.id || checkingBalance,
          style: {
            background: selectedPackage?.color,
            borderColor: selectedPackage?.color,
          },
        }}
        width={500}
      >
        {selectedPackage && (
          <div>
            {/* Warning nếu có gói cũ đang active */}
            {currentPackage && new Date(currentPackage.endTime) > new Date() && (
              <div
                style={{
                  background: "linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)",
                  border: "1px solid #ffc107",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  marginBottom: "16px",
                }}
              >
                <p style={{ margin: 0, color: "#856404", fontWeight: "bold" }}>
                  ⚠️ Lưu ý: Bạn đang có gói "{currentPackage.name}" đang hoạt động
                </p>
                <p style={{ margin: "8px 0 0 0", color: "#856404", fontSize: "13px" }}>
                  Khi mua gói mới, gói hiện tại sẽ bị vô hiệu hóa và gói mới sẽ được kích hoạt ngay lập tức.
                </p>
              </div>
            )}

            <p style={{ fontSize: "16px", marginBottom: "16px" }}>
              Bạn có chắc chắn muốn mua gói{" "}
              <strong style={{ color: selectedPackage.color }}>
                {selectedPackage.name}
              </strong>
              ?
            </p>

            {/* Thông tin gói */}
            <div
              style={{
                background: "#f5f5f5",
                padding: "16px",
                borderRadius: "8px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                  paddingBottom: "12px",
                  borderBottom: "1px solid #e0e0e0",
                }}
              >
                <span style={{ fontWeight: "500" }}>Giá gói:</span>
                <strong style={{ color: selectedPackage.color, fontSize: "16px" }}>
                  {formatPrice(selectedPackage.price)}
                </strong>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                  paddingBottom: "12px",
                  borderBottom: "1px solid #e0e0e0",
                }}
              >
                <span style={{ fontWeight: "500" }}>Số bài đăng:</span>
                <strong>
                  {selectedPackage.postLimit === 9999
                    ? "Không giới hạn"
                    : selectedPackage.postLimit}
                </strong>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                  paddingBottom: "12px",
                  borderBottom: "1px solid #e0e0e0",
                }}
              >
                <span style={{ fontWeight: "500" }}>Thời hạn:</span>
                <strong>{selectedPackage.duration} ngày</strong>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "12px",
                }}
              >
                <span style={{ fontWeight: "500" }}>Số dư hiện tại:</span>
                <strong
                  style={{
                    color: walletBalance >= selectedPackage.price ? "#52c41a" : "#ff4d4f",
                    fontSize: "16px",
                  }}
                >
                  {formatPrice(walletBalance)}
                </strong>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "8px",
                }}
              >
                <span style={{ fontWeight: "500" }}>Số dư sau khi mua:</span>
                <strong
                  style={{
                    color: walletBalance >= selectedPackage.price ? "#52c41a" : "#ff4d4f",
                  }}
                >
                  {formatPrice(walletBalance - selectedPackage.price)}
                </strong>
              </div>
            </div>

            {/* Thông báo */}
            {walletBalance >= selectedPackage.price ? (
              <p style={{ color: "#52c41a", fontSize: "14px", margin: 0 }}>
                ✓ Số dư đủ để thực hiện giao dịch
              </p>
            ) : (
              <p style={{ color: "#ff4d4f", fontSize: "14px", margin: 0 }}>
                ✗ Số dư không đủ. Vui lòng nạp thêm tiền vào ví.
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PackagesList;
