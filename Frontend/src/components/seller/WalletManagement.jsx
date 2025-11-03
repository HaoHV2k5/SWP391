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
  const [orderInfo, setOrderInfo] = useState("recharge wallet");
  const [bankCode, setBankCode] = useState("VNPAYQR");
  const [language, setLanguage] = useState("vn");
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [addr1, setAddr1] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("VN");

  const rechargeAmounts = [
    { value: 50000, label: "50,000 VND" },
    { value: 100000, label: "100,000 VND" },
    { value: 200000, label: "200,000 VND" },
    { value: 500000, label: "500,000 VND" },
    { value: 1000000, label: "1,000,000 VND" },
  ];

  useEffect(() => {
    fetchWalletData();
    // Nếu vừa thanh toán xong, refresh dữ liệu
    if (sessionStorage.getItem("wallet.reload") === "1") {
      sessionStorage.removeItem("wallet.reload");
      // Delay một chút để đảm bảo backend đã cập nhật xong
      setTimeout(() => {
        fetchWalletData();
        message.success("Ví đã được cập nhật sau thanh toán");
      }, 1500);
    }
    
    // Listen for wallet.reload event từ PaymentReturnPage
    const handleWalletReload = () => {
      setTimeout(() => {
        fetchWalletData();
        message.success("Ví đã được cập nhật sau thanh toán");
      }, 1500);
    };
    
    window.addEventListener('wallet.reload', handleWalletReload);
    
    return () => {
      window.removeEventListener('wallet.reload', handleWalletReload);
    };
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
    const token = localStorage.getItem("token");
    if (!token) {
      message.error("Bạn cần đăng nhập để nạp tiền.");
      // Nếu đang ở trang staff có bảo vệ, chuyển hướng
      try {
        if (location.pathname.startsWith("/staff")) {
          location.replace("/login");
        }
      } catch (e) {
        console.warn("Redirect to login failed:", e);
      }
      return;
    }

    // Lấy userId từ props hoặc localStorage
    let userId = user?.id;
    if (!userId) {
      try {
        const raw = localStorage.getItem("userData");
        if (raw) {
          const parsed = JSON.parse(raw);
          userId = parsed?.id || parsed?.user?.id || parsed?.userId;
        }
      } catch (e) {
        console.warn("Parse userData failed:", e);
      }
    }
    if (!userId) {
      message.error("Không tìm thấy thông tin người dùng!");
      return;
    }

    try {
      const payload = {
        userId,
        amount: rechargeAmount,
        vnp_OrderInfo: orderInfo || "recharge",
        ordertype: "recharge",
        bankcode: bankCode || undefined,
        language: language || "vn",
        txt_billing_fullname: fullName,
        txt_billing_mobile: mobile,
        txt_billing_email: email,
        txt_inv_addr1: addr1,
        txt_bill_city: city,
        txt_bill_country: country || "VN",
      };

      const response = await paymentService.rechargeWallet(payload);

      // Hỗ trợ nhiều format phản hồi từ BE
      const paymentUrl =
        response?.paymentUrl ||
        response?.data?.paymentUrl ||
        response?.data?.data; // theo ảnh: { code:1000, data:{ code:'00', message:'success', data:'<url>' } }

      if (
        response?.code === 1000 &&
        response?.data?.code === "00" &&
        paymentUrl
      ) {
        // Mở cửa sổ thanh toán VNPay
        const paymentWindow = window.open(
          paymentUrl,
          "vnpay_payment",
          "width=800,height=600,scrollbars=yes,resizable=yes"
        );

        // Poll dữ liệu ví trong khi popup đang mở (2s/lần, tối đa ~2 phút)
        let polls = 0;
        let lastTxCount = Array.isArray(walletTransactions)
          ? walletTransactions.length
          : 0;
        const pollInterval = setInterval(async () => {
          polls += 1;
          try {
            const resTx = await paymentService.getWalletTransactions();
            const list = resTx?.data || [];
            if (Array.isArray(list) && list.length !== lastTxCount) {
              setWalletTransactions(list);
              lastTxCount = list.length;
            }
          } catch {
            // ignore
          }
          if (polls >= 60) {
            clearInterval(pollInterval);
          }
        }, 2000);

        // Kiểm tra cửa sổ thanh toán có bị đóng không
        const checkClosed = setInterval(() => {
          if (paymentWindow.closed) {
            clearInterval(checkClosed);
            clearInterval(pollInterval);
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
      // Xử lý lỗi cụ thể cho từng trường hợp
      if (error?.code === "WALLET_NOT_EXIST") {
        // Lỗi ví chưa tồn tại - hiển thị message rõ ràng, không log console
        message.error({
          content:
            error.message ||
            "Ví của bạn chưa được khởi tạo. Vui lòng liên hệ quản trị viên để được hỗ trợ.",
          duration: 6,
        });
      } else {
        // Các lỗi khác - log để debug
        console.error("Error recharging wallet:", error);
        const errorMessage =
          error?.response?.data?.data?.message ||
          error?.response?.data?.message ||
          error?.message ||
          "Có lỗi xảy ra khi nạp tiền. Vui lòng thử lại!";
        message.error(errorMessage);
      }
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
      render: (amount, record) => {
        // Kiểm tra cả type và typeWalletTraction, xử lý cả uppercase và lowercase
        const type = (
          (record.typeWalletTraction || record.type || "") + ""
        ).toLowerCase();
        const isRecharge =
          type === "recharge" ||
          type.includes("recharge") ||
          type.includes("nạp") ||
          type.includes("deposit") ||
          type.includes("refund");

        // Recharge → màu xanh lá (+), Payment → màu xanh dương (-)
        const color = isRecharge ? "#52c41a" : "#1890ff";
        const sign = isRecharge ? "+" : "-";

        return (
          <Text
            style={{
              color: color,
              fontWeight: "bold",
            }}
          >
            {sign}
            {formatPrice(amount)}
          </Text>
        );
      },
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

          <Row gutter={12}>
            <Col span={12}>
              <Text>Mô tả đơn hàng</Text>
              <Input
                placeholder="vnp_OrderInfo"
                value={orderInfo}
                onChange={(e) => setOrderInfo(e.target.value)}
                style={{ marginTop: 6, marginBottom: 12 }}
              />
            </Col>
            <Col span={12}>
              <Text>Phương thức</Text>
              <Select
                value={bankCode}
                onChange={setBankCode}
                style={{ width: "100%", marginTop: 6, marginBottom: 12 }}
              >
                <Option value="">Mặc định</Option>
                <Option value="VNPAYQR">VNPAYQR</Option>
                <Option value="VNBANK">VNBANK</Option>
                <Option value="INTCARD">INTCARD</Option>
              </Select>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Text>Ngôn ngữ</Text>
              <Select
                value={language}
                onChange={setLanguage}
                style={{ width: "100%", marginTop: 6, marginBottom: 12 }}
              >
                <Option value="vn">Tiếng Việt</Option>
                <Option value="en">English</Option>
              </Select>
            </Col>
            <Col span={12}>
              <Text>Họ tên</Text>
              <Input
                placeholder="Nguyen Van A"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{ marginTop: 6, marginBottom: 12 }}
              />
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Text>Điện thoại</Text>
              <Input
                placeholder="0912345678"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                style={{ marginTop: 6, marginBottom: 12 }}
              />
            </Col>
            <Col span={12}>
              <Text>Email</Text>
              <Input
                placeholder="test@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ marginTop: 6, marginBottom: 12 }}
              />
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Text>Địa chỉ</Text>
              <Input
                placeholder="Ha Noi"
                value={addr1}
                onChange={(e) => setAddr1(e.target.value)}
                style={{ marginTop: 6, marginBottom: 12 }}
              />
            </Col>
            <Col span={12}>
              <Text>Thành phố</Text>
              <Input
                placeholder="Hanoi"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                style={{ marginTop: 6, marginBottom: 12 }}
              />
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Text>Quốc gia</Text>
              <Input
                placeholder="VN"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                style={{ marginTop: 6, marginBottom: 12 }}
              />
            </Col>
          </Row>

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
