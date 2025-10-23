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
} from "@ant-design/icons";
import { paymentService } from "../../services/paymentService";

const PackagesList = ({ user }) => {
  const [packages, setPackages] = useState([]);
  const [currentPackage, setCurrentPackage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buyingPackage, setBuyingPackage] = useState(null);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);

  // Mock data cho 3 gói dịch vụ (dựa trên database bạn đã gửi)
  const mockPackages = [
    {
      id: 4,
      name: "Gói Cơ Bản",
      description: "Đăng tối đa 5 tin trong 30 ngày",
      price: 50000,
      duration: 30,
      postLimit: 5,
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
  ];

  useEffect(() => {
    fetchCurrentPackage();
  }, []);

  const fetchCurrentPackage = async () => {
    try {
      setLoading(true);
      const response = await paymentService.getCurrentPackage();
      setCurrentPackage(response.data);
    } catch (error) {
      console.log("No current package or error:", error);
      setCurrentPackage(null);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyPackage = (pkg) => {
    setSelectedPackage(pkg);
    setConfirmModalVisible(true);
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
        fetchCurrentPackage(); // Refresh current package
      } else {
        message.error(response.message || "Mua gói thất bại!");
      }
    } catch (error) {
      console.error("Error buying package:", error);
      message.error("Có lỗi xảy ra khi mua gói. Vui lòng thử lại!");
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
      return <Tag color="green">Đang sử dụng</Tag>;
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
        <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "bold" }}>
          <WalletOutlined style={{ marginRight: "8px", color: "#1890ff" }} />
          Gói Dịch Vụ Đăng Tin
        </h2>
        <p style={{ color: "#666", margin: "8px 0 0 0" }}>
          Chọn gói dịch vụ phù hợp để đăng tin bán hàng hiệu quả
        </p>
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

      <Row gutter={[24, 24]}>
        {mockPackages.map((pkg) => (
          <Col xs={24} sm={12} lg={8} key={pkg.id}>
            <Card
              hoverable
              style={{
                height: "100%",
                border:
                  currentPackage?.name === pkg.name
                    ? "2px solid #52c41a"
                    : "1px solid #d9d9d9",
                position: "relative",
              }}
              styles={{ body: { padding: "24px" } }}
            >
              {getPackageStatus(pkg)}

              <div style={{ textAlign: "center", marginBottom: "20px" }}>
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

              <div style={{ textAlign: "center", marginBottom: "24px" }}>
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

              <div style={{ marginBottom: "24px" }}>
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
                  height: "48px",
                  fontSize: "16px",
                  fontWeight: "bold",
                }}
                onClick={() => handleBuyPackage(pkg)}
                loading={buyingPackage === pkg.id}
                disabled={currentPackage?.name === pkg.name}
              >
                {currentPackage?.name === pkg.name
                  ? "Đang sử dụng"
                  : "Mua ngay"}
              </Button>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Confirmation Modal */}
      <Modal
        title="Xác nhận mua gói"
        open={confirmModalVisible}
        onOk={confirmBuyPackage}
        onCancel={() => setConfirmModalVisible(false)}
        okText="Xác nhận mua"
        cancelText="Hủy"
        okButtonProps={{
          loading: buyingPackage === selectedPackage?.id,
          style: {
            background: selectedPackage?.color,
            borderColor: selectedPackage?.color,
          },
        }}
      >
        {selectedPackage && (
          <div>
            <p>
              Bạn có chắc chắn muốn mua gói{" "}
              <strong>{selectedPackage.name}</strong>?
            </p>
            <div
              style={{
                background: "#f5f5f5",
                padding: "16px",
                borderRadius: "8px",
                margin: "16px 0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <span>Giá:</span>
                <strong style={{ color: selectedPackage.color }}>
                  {formatPrice(selectedPackage.price)}
                </strong>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <span>Số bài đăng:</span>
                <strong>
                  {selectedPackage.postLimit === 9999
                    ? "Không giới hạn"
                    : selectedPackage.postLimit}
                </strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Thời hạn:</span>
                <strong>{selectedPackage.duration} ngày</strong>
              </div>
            </div>
            <p style={{ color: "#666", fontSize: "14px" }}>
              Số tiền sẽ được trừ từ ví của bạn. Nếu không đủ tiền, vui lòng nạp
              thêm vào ví.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PackagesList;
