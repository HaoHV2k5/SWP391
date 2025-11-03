import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Table,
  Tag,
  Space,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Typography,
  Divider,
  Empty,
} from "antd";
import {
  WalletOutlined,
  BankOutlined,
  PlusOutlined,
  EyeOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import withdrawalService from "../../services/withdrawalService";
import { toast } from "react-toastify";

const { Title, Text } = Typography;

const WithdrawalRequest = ({ user }) => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [requestModalVisible, setRequestModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (user?.id) {
      loadWithdrawals();
    }
  }, [user]);

  const loadWithdrawals = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const response = await withdrawalService.getUserWithdrawals(user.id);
      const withdrawalsList = response?.data || response || [];
      setWithdrawals(withdrawalsList);
    } catch (error) {
      console.error("Error loading withdrawals:", error);
      toast.error("Lỗi khi tải danh sách yêu cầu rút tiền!");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async (values) => {
    if (!user?.id) {
      toast.error("Vui lòng đăng nhập lại!");
      return;
    }

    try {
      setLoading(true);
      await withdrawalService.createWithdrawalRequest(user.id, {
        amount: values.amount,
        bankInfo: values.bankInfo,
        accountNumber: values.accountNumber,
        accountHolderName: values.accountHolderName,
        note: values.note || "",
      });

      toast.success("Tạo yêu cầu rút tiền thành công!");
      form.resetFields();
      setRequestModalVisible(false);
      loadWithdrawals();
    } catch (error) {
      console.error("Error creating withdrawal request:", error);
      toast.error(
        `Lỗi khi tạo yêu cầu: ${error.response?.data?.message || error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (withdrawalId) => {
    if (!user?.id) {
      toast.error("Vui lòng đăng nhập lại!");
      return;
    }

    Modal.confirm({
      title: "Xác nhận hủy yêu cầu",
      content: "Bạn có chắc chắn muốn hủy yêu cầu rút tiền này không?",
      okText: "Hủy yêu cầu",
      cancelText: "Đóng",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          setLoading(true);
          await withdrawalService.cancelWithdrawal(withdrawalId, user.id);
          toast.success("Hủy yêu cầu rút tiền thành công!");
          loadWithdrawals();
        } catch (error) {
          console.error("Error canceling withdrawal:", error);
          toast.error(
            `Lỗi khi hủy: ${error.response?.data?.message || error.message}`
          );
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const getStatusColor = (status) => {
    const statusUpper = (status || "").toUpperCase();
    switch (statusUpper) {
      case "PENDING":
        return "orange";
      case "COMPLETED":
        return "green";
      case "CANCELLED":
      case "FAILED":
        return "red";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status) => {
    const statusUpper = (status || "").toUpperCase();
    switch (statusUpper) {
      case "PENDING":
        return "Đang chờ";
      case "COMPLETED":
        return "Hoàn thành";
      case "CANCELLED":
        return "Đã hủy";
      case "FAILED":
        return "Thất bại";
      default:
        return status || "Không xác định";
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return "0 VNĐ";
    return new Intl.NumberFormat("vi-VN").format(amount) + " VNĐ";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa có";
    try {
      return new Date(dateString).toLocaleString("vi-VN");
    } catch {
      return "Chưa có";
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      render: (id) => `#${id}`,
    },
    {
      title: "Mã GD",
      dataIndex: "transactionCode",
      key: "transactionCode",
      width: 120,
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      width: 150,
      render: (amount) => (
        <Text strong style={{ color: "#52c41a" }}>
          {formatCurrency(amount)}
        </Text>
      ),
    },
    {
      title: "Ngân hàng",
      dataIndex: "bankInfo",
      key: "bankInfo",
      width: 120,
    },
    {
      title: "Số TK",
      dataIndex: "accountNumber",
      key: "accountNumber",
      width: 120,
    },
    {
      title: "Chủ TK",
      dataIndex: "accountHolderName",
      key: "accountHolderName",
      width: 150,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusLabel(status)}</Tag>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (date) => formatDate(date),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
      render: (_, record) => {
        const isPending = (record.status || "").toUpperCase() === "PENDING";
        return (
          <Space size="small">
            {isPending && (
              <Button
                size="small"
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => handleCancel(record.id)}
                loading={loading}
              >
                Hủy
              </Button>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <Title level={4} style={{ margin: 0 }}>
          <WalletOutlined style={{ marginRight: "8px" }} />
          Quản lý rút tiền
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setRequestModalVisible(true)}
          size="large"
        >
          Tạo yêu cầu rút tiền
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={withdrawals}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} yêu cầu`,
          }}
          locale={{
            emptyText: <Empty description="Chưa có yêu cầu rút tiền nào" />,
          }}
        />
      </Card>

      {/* Modal tạo yêu cầu rút tiền */}
      <Modal
        title={
          <span>
            <PlusOutlined style={{ marginRight: "8px" }} />
            Tạo yêu cầu rút tiền
          </span>
        }
        open={requestModalVisible}
        onCancel={() => {
          form.resetFields();
          setRequestModalVisible(false);
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateRequest}
          initialValues={{
            amount: 100000,
          }}
        >
          <Form.Item
            label="Số tiền rút (VNĐ)"
            name="amount"
            rules={[
              { required: true, message: "Vui lòng nhập số tiền!" },
              {
                type: "number",
                min: 10000,
                message: "Số tiền tối thiểu là 10,000 VNĐ!",
              },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={10000}
              step={10000}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
              placeholder="Nhập số tiền muốn rút"
            />
          </Form.Item>

          <Form.Item
            label="Thông tin ngân hàng"
            name="bankInfo"
            rules={[
              { required: true, message: "Vui lòng nhập tên ngân hàng!" },
            ]}
          >
            <Input
              prefix={<BankOutlined />}
              placeholder="Ví dụ: Vietcombank, Techcombank, BIDV..."
            />
          </Form.Item>

          <Form.Item
            label="Số tài khoản"
            name="accountNumber"
            rules={[
              { required: true, message: "Vui lòng nhập số tài khoản!" },
            ]}
          >
            <Input placeholder="Nhập số tài khoản ngân hàng" />
          </Form.Item>

          <Form.Item
            label="Tên chủ tài khoản"
            name="accountHolderName"
            rules={[
              { required: true, message: "Vui lòng nhập tên chủ tài khoản!" },
            ]}
          >
            <Input placeholder="Nhập tên chủ tài khoản (viết HOA, không dấu)" />
          </Form.Item>

          <Form.Item label="Ghi chú (tùy chọn)" name="note">
            <Input.TextArea
              rows={3}
              placeholder="Nhập ghi chú nếu có..."
            />
          </Form.Item>

          <Divider />

          <Form.Item>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button
                onClick={() => {
                  form.resetFields();
                  setRequestModalVisible(false);
                }}
              >
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Tạo yêu cầu
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default WithdrawalRequest;

