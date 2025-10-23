// src/components/seller/WalletManagement.jsx
import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Table,
  Tag,
  Space,
  Statistic,
  Row,
  Col,
  Spin,
  message,
  Modal,
  Input,
  Select,
  Typography,
  Divider,
} from "antd";
import {
  WalletOutlined,
  PlusOutlined,
  HistoryOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { paymentService } from "../../services/paymentService";

const { Title, Text } = Typography;
const { Option } = Select;

const WalletManagement = ({ user }) => {
  const [walletTransactions, setWalletTransactions] = useState([]);
  const [packageHistory, setPackageHistory] = useState([]);
  const [currentPackage, setCurrentPackage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rechargeModalVisible, setRechargeModalVisible] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState(100000);

  const rechargeAmounts = [
    { value: 50000, label: "50,000 VND" },
    { value: 100000, label: "100,000 VND" },
    { value: 200000, label: "200,000 VND" },
    { value: 500000, label: "500,000 VND" },
    { value: 1000000, label: "1,000,000 VND" },
  ];

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const [walletRes, packageRes, currentRes] = await Promise.all([
        paymentService.getWalletTransactions(),
        paymentService.getPackageHistory(),
        paymentService.getCurrentPackage().catch(() => ({ data: null })),
      ]);

      setWalletTransactions(walletRes.data || []);
      setPackageHistory(packageRes.data || []);
      setCurrentPackage(currentRes.data);
    } catch (error) {
      console.error("Error fetching wallet data:", error);
      message.error("Không thể tải dữ liệu ví. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const handleRecharge = async () => {
    if (!user?.id) {
      message.error("Không tìm thấy thông tin người dùng!");
      return;
    }

    try {
      const response = await paymentService.rechargeWallet(user.id);

      if (response.data?.paymentUrl) {
        // Mở cửa sổ thanh toán VNPay
        const paymentWindow = window.open(
          response.data.paymentUrl,
          "vnpay_payment",
          "width=800,height=600,scrollbars=yes,resizable=yes"
        );

        // Kiểm tra cửa sổ thanh toán có bị đóng không
        const checkClosed = setInterval(() => {
          if (paymentWindow.closed) {
            clearInterval(checkClosed);
            message.info(
              "Đã đóng cửa sổ thanh toán. Vui lòng kiểm tra lại ví của bạn."
            );
            fetchWalletData(); // Refresh data
          }
        }, 1000);

        setRechargeModalVisible(false);
        message.success("Đang chuyển đến trang thanh toán VNPay...");
      } else {
        message.error("Không thể tạo link thanh toán. Vui lòng thử lại!");
      }
    } catch (error) {
      console.error("Error recharging wallet:", error);
      message.error("Có lỗi xảy ra khi nạp tiền. Vui lòng thử lại!");
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  const getTransactionTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case "recharge":
      case "nạp tiền":
        return "green";
      case "buy":
      case "mua gói":
        return "blue";
      case "refund":
      case "hoàn tiền":
        return "orange";
      default:
        return "default";
    }
  };

  const getTransactionIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "recharge":
      case "nạp tiền":
        return <PlusOutlined />;
      case "buy":
      case "mua gói":
        return <ShoppingCartOutlined />;
      case "refund":
      case "hoàn tiền":
        return <ReloadOutlined />;
      default:
        return <DollarOutlined />;
    }
  };

  // Columns cho bảng lịch sử ví
  const walletColumns = [
    {
      title: "Loại giao dịch",
      dataIndex: "type",
      key: "type",
      render: (type) => (
        <Tag
          color={getTransactionTypeColor(type)}
          icon={getTransactionIcon(type)}
        >
          {type}
        </Tag>
      ),
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      render: (amount, record) => (
        <Text
          style={{
            color: record.type?.toLowerCase().includes("recharge")
              ? "#52c41a"
              : "#1890ff",
            fontWeight: "bold",
          }}
        >
          {record.type?.toLowerCase().includes("recharge") ? "+" : "-"}
          {formatPrice(amount)}
        </Text>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Thời gian",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => formatDate(date),
    },
  ];

  // Columns cho bảng lịch sử mua gói
  const packageColumns = [
    {
      title: "Tên gói",
      dataIndex: "packageName",
      key: "packageName",
      render: (name) => <Text strong>{name}</Text>,
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (price) => (
        <Text style={{ color: "#1890ff", fontWeight: "bold" }}>
          {formatPrice(price)}
        </Text>
      ),
    },
    {
      title: "Số bài đăng",
      dataIndex: "postLimit",
      key: "postLimit",
      render: (limit) => (limit === 9999 ? "Không giới hạn" : limit),
    },
    {
      title: "Thời hạn",
      dataIndex: "duration",
      key: "duration",
      render: (duration) => `${duration} ngày`,
    },
    {
      title: "Trạng thái",
      dataIndex: "active",
      key: "active",
      render: (active, record) => {
        const now = new Date();
        const endTime = new Date(record.endTime);
        const isExpired = now > endTime;

        if (isExpired) {
          return <Tag color="red">Hết hạn</Tag>;
        }
        return active ? (
          <Tag color="green">Đang sử dụng</Tag>
        ) : (
          <Tag color="orange">Không hoạt động</Tag>
        );
      },
    },
    {
      title: "Ngày mua",
      dataIndex: "startTime",
      key: "startTime",
      render: (date) => formatDate(date),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
        <p>Đang tải thông tin ví...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: "24px" }}>
        <Title level={2} style={{ margin: 0 }}>
          <WalletOutlined style={{ marginRight: "8px", color: "#1890ff" }} />
          Quản Lý Ví
        </Title>
        <Text type="secondary">Quản lý số dư và lịch sử giao dịch của bạn</Text>
      </div>

      {/* Current Package Info */}
      {currentPackage && (
        <Card
          style={{
            marginBottom: "24px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <div>
                <Title level={4} style={{ color: "white", margin: 0 }}>
                  <ShoppingCartOutlined style={{ marginRight: "8px" }} />
                  Gói hiện tại: {currentPackage.name}
                </Title>
                <Text style={{ color: "rgba(255,255,255,0.8)" }}>
                  Còn lại: {currentPackage.postPossible} bài đăng
                </Text>
              </div>
            </Col>
            <Col span={12}>
              <div style={{ textAlign: "right" }}>
                <Text style={{ color: "rgba(255,255,255,0.8)" }}>
                  Hết hạn: {formatDate(currentPackage.endTime)}
                </Text>
              </div>
            </Col>
          </Row>
        </Card>
      )}

      {/* Quick Actions */}
      <Card style={{ marginBottom: "24px" }}>
        <Row gutter={16}>
          <Col span={12}>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={() => setRechargeModalVisible(true)}
              style={{ width: "100%", height: "60px", fontSize: "16px" }}
            >
              Nạp tiền vào ví
            </Button>
          </Col>
          <Col span={12}>
            <Button
              size="large"
              icon={<ReloadOutlined />}
              onClick={fetchWalletData}
              style={{ width: "100%", height: "60px", fontSize: "16px" }}
            >
              Làm mới dữ liệu
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Wallet Transactions */}
      <Card
        title={
          <Space>
            <HistoryOutlined />
            Lịch sử giao dịch ví
          </Space>
        }
        style={{ marginBottom: "24px" }}
      >
        <Table
          columns={walletColumns}
          dataSource={walletTransactions}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: "Chưa có giao dịch nào" }}
        />
      </Card>

      {/* Package History */}
      <Card
        title={
          <Space>
            <ShoppingCartOutlined />
            Lịch sử mua gói
          </Space>
        }
      >
        <Table
          columns={packageColumns}
          dataSource={packageHistory}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: "Chưa mua gói nào" }}
        />
      </Card>

      {/* Recharge Modal */}
      <Modal
        title="Nạp tiền vào ví"
        open={rechargeModalVisible}
        onOk={handleRecharge}
        onCancel={() => setRechargeModalVisible(false)}
        okText="Nạp tiền"
        cancelText="Hủy"
        okButtonProps={{ type: "primary" }}
      >
        <div>
          <p>Chọn số tiền muốn nạp vào ví:</p>
          <Select
            style={{ width: "100%", marginBottom: "16px" }}
            value={rechargeAmount}
            onChange={setRechargeAmount}
            size="large"
          >
            {rechargeAmounts.map((amount) => (
              <Option key={amount.value} value={amount.value}>
                {amount.label}
              </Option>
            ))}
          </Select>

          <Divider />

          <div
            style={{
              background: "#f5f5f5",
              padding: "16px",
              borderRadius: "8px",
            }}
          >
            <Row justify="space-between">
              <Col>
                <Text>Số tiền nạp:</Text>
              </Col>
              <Col>
                <Text strong style={{ color: "#52c41a", fontSize: "16px" }}>
                  {formatPrice(rechargeAmount)}
                </Text>
              </Col>
            </Row>
          </div>

          <Text type="secondary" style={{ fontSize: "12px" }}>
            Sau khi xác nhận, bạn sẽ được chuyển đến trang thanh toán VNPay
          </Text>
        </div>
      </Modal>
    </div>
  );
};

export default WalletManagement;
