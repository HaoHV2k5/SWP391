// src/pages/OrdersBought.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Table,
  Tag,
  Typography,
  Space,
  Input,
  Button,
  Tooltip,
  Skeleton,
  message,
  Spin,
  Row,
  Col,
  Statistic,
} from "antd";
import {
  ReloadOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import memberService from "../../services/memberService";

const { Title, Text } = Typography;

// Chuẩn hoá LocalDateTime -> Date hợp lệ (trim micro/nanoseconds xuống mili-giây)
const parseIsoLocal = (iso) => {
  if (!iso) return null;
  // ví dụ: 2025-10-26T15:03:44.779605 -> giữ lại 3 số thập phân
  const fixed = iso.replace(/(\.\d{3})\d+/, "$1");
  const d = new Date(fixed);
  return isNaN(d) ? null : d;
};

const fmtVND = (n) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(n || 0));

const fmtDate = (iso) => {
  const d = parseIsoLocal(iso);
  return d ? d.toLocaleString("vi-VN", { hour12: false }) : "—";
};

const STATUS_COLOR = {
  PENDING: "gold",
  ACCEPTED: "blue",
  COMPLETED: "green",
  REJECTED: "red",
  CANCELLED: "default",
};

export default function OrdersBought({ user }) {
  const navigate = useNavigate();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [buyerId, setBuyerId] = useState("");
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState("");

  // Kiểm tra authentication khi component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("userData");

    if (!token || !userData) {
      // Nếu không có token hoặc userData, đợi một chút để kiểm tra lại (trường hợp đang load)
      const timer = setTimeout(() => {
        const checkToken = localStorage.getItem("token");
        const checkUserData = localStorage.getItem("userData");
        if (!checkToken || !checkUserData) {
          navigate("/login");
        } else {
          setIsCheckingAuth(false);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }

    setIsCheckingAuth(false);

    // Lấy user ID từ user prop hoặc localStorage
    const getUserId = () => {
      if (user?.id) return user.id;
      if (user?.user?.id) return user.user.id;
      if (user?.userId) return user.userId;
      
      try {
        const parsed = JSON.parse(userData);
        return parsed?.id || parsed?.user?.id || parsed?.userId;
      } catch {
        return null;
      }
    };

    const userId = getUserId();
    if (userId) {
      setBuyerId(String(userId));
      load(userId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate]);

  const load = async (id) => {
    if (!id) {
      message.warning("Không thể xác định user ID. Vui lòng đăng nhập lại.");
      return;
    }
    try {
      setLoading(true);
      const numericId = typeof id === "string" ? parseInt(id, 10) : id;
      const res = await memberService.getBoughtOrders(numericId);
      if (!res.success) {
        message.error(res.message || "Không tải được danh sách đơn hàng");
        setRows([]);
        return;
      }
      // res.data là mảng OrderResponse đúng theo backend
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      message.error("Không tải được danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      String(r.productName ?? "")
        .toLowerCase()
        .includes(q)
    );
  }, [rows, query]);

  const columns = [
    {
      title: "Order ID",
      dataIndex: "id",
      width: 100,
      sorter: (a, b) => Number(a.id) - Number(b.id),
      render: (v) => (
        <Text strong style={{ color: "#00A86B" }}>
          #{v}
        </Text>
      ),
    },
    {
      title: "Sản phẩm",
      dataIndex: "productName",
      ellipsis: true,
      render: (v, r) => (
        <Space direction="vertical" size={2}>
          <Text
            strong
            ellipsis={{ tooltip: v || "—" }}
            style={{ color: "#1f2937" }}
          >
            {v || "—"}
          </Text>
          <Text style={{ color: "#6b7280", fontSize: 12 }}>
            ID: {r.productId ?? "—"}
          </Text>
        </Space>
      ),
    },
    {
      title: "Người bán",
      dataIndex: "sellerName",
      width: 220,
      render: (v) => (
        <Text
          ellipsis={{ tooltip: v || "—" }}
          style={{ color: "#374151" }}
        >
          {v || "—"}
        </Text>
      ),
    },
    {
      title: "Giá đề xuất",
      dataIndex: "offeredPrice",
      width: 160,
      align: "right",
      render: (v) => (
        <Text strong style={{ color: "#00A86B", fontSize: 14 }}>
          {fmtVND(v)}
        </Text>
      ),
      sorter: (a, b) =>
        Number(a.offeredPrice || 0) - Number(b.offeredPrice || 0),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: 140,
      filters: [
        "PENDING",
        "ACCEPTED",
        "COMPLETED",
        "REJECTED",
        "CANCELLED",
      ].map((s) => ({ text: s, value: s })),
      onFilter: (val, rec) => String(rec.status) === String(val),
      render: (s) => (
        <Tag
          color={STATUS_COLOR[s] ?? "default"}
          style={{
            fontWeight: 500,
            padding: "4px 12px",
            borderRadius: 6,
          }}
        >
          {s || "—"}
        </Tag>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      width: 200,
      sorter: (a, b) =>
        (parseIsoLocal(a.createdAt)?.getTime() || 0) -
        (parseIsoLocal(b.createdAt)?.getTime() || 0),
      defaultSortOrder: "descend",
      render: (v) => (
        <Text style={{ color: "#6b7280" }}>{fmtDate(v)}</Text>
      ),
    },
  ];

  // Tính toán thống kê
  const stats = useMemo(() => {
    const total = filtered.reduce((acc, r) => acc + Number(r.offeredPrice || 0), 0);
    const completed = filtered.filter((r) => r.status === "COMPLETED").length;
    const pending = filtered.filter((r) => r.status === "PENDING").length;
    return { total, completed, pending, totalOrders: filtered.length };
  }, [filtered]);

  // Hiển thị loading khi đang kiểm tra authentication
  if (isCheckingAuth) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #bbf7d0 100%)"
      }}>
        <Spin size="large" tip="Đang kiểm tra quyền truy cập..." />
      </div>
    );
  }

  return (
    <div
      style={{
        padding: 8,
        background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #bbf7d0 100%)",
        borderRadius: 16,
        minHeight: "100vh",
      }}
    >
      {/* CSS override cho giao diện xanh lá và trắng */}
      <style>{`
        .orders-bought-card {
          background: #ffffff;
          border: 1px solid #86efac;
          border-radius: 16px !important;
          box-shadow: 0 4px 16px rgba(34, 197, 94, 0.1);
          color: #1f2937;
        }
        .orders-bought-card .ant-card-head {
          background: linear-gradient(135deg, #00A86B 0%, #22c55e 100%);
          border-bottom: 2px solid #16a34a;
          border-radius: 16px 16px 0 0;
        }
        .orders-bought-card .ant-card-head-title {
          color: #fff;
        }
        .orders-bought-card .ant-card-body {
          background: #ffffff;
        }
        .stat-card {
          background: linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%);
          border: 2px solid #86efac;
          border-radius: 14px;
          box-shadow: 0 2px 8px rgba(34, 197, 94, 0.1);
          padding: 20px;
          height: 100%;
          transition: all 0.3s ease;
        }
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(34, 197, 94, 0.2);
          border-color: #22c55e;
        }
        .stat-card .ant-statistic-title {
          color: #4b5563;
          font-size: 13px;
          font-weight: 500;
        }
        .stat-card .ant-statistic-content {
          color: #1f2937;
        }
        .orders-table .ant-table {
          background: #ffffff;
          color: #1f2937;
        }
        .orders-table .ant-table-thead > tr > th {
          background: #f0fdf4 !important;
          color: #15803d;
          border-bottom: 2px solid #86efac;
          font-weight: 600;
        }
        .orders-table .ant-table-tbody > tr > td {
          background: #ffffff;
          border-bottom: 1px solid #d1fae5;
          transition: all 0.2s ease;
        }
        .orders-table .ant-table-tbody > tr:hover > td {
          background: #f0fdf4 !important;
          color: #1f2937 !important;
        }
        .orders-table .ant-table-tbody > tr {
          transition: all 0.2s ease;
        }
        .orders-table .ant-table-tbody > tr:hover {
          transform: translateX(2px);
          box-shadow: 0 2px 8px rgba(34, 197, 94, 0.15);
        }
        .orders-table .ant-pagination .ant-pagination-item-active {
          border-color: #00A86B;
        }
        .orders-table .ant-pagination .ant-pagination-item-active a {
          color: #00A86B;
        }
        .search-input .ant-input,
        .search-input .ant-input-affix-wrapper {
          background: #ffffff;
          border-color: #86efac;
          color: #1f2937;
        }
        .search-input .ant-input-affix-wrapper:hover,
        .search-input .ant-input-affix-wrapper-focused {
          border-color: #22c55e;
        }
        .search-input .ant-input::placeholder {
          color: #9ca3af;
        }
        .orders-table .ant-table-summary {
          background: #f0fdf4;
        }
        .orders-table .ant-table-summary td {
          border-top: 2px solid #86efac;
        }
      `}</style>

      <Card
        className="orders-bought-card"
        title={
          <Space>
            <ShoppingCartOutlined style={{ fontSize: 20, color: "#fff" }} />
            <Title level={4} style={{ margin: 0, color: "#fff" }}>
              Đơn hàng đã mua
            </Title>
          </Space>
        }
        bodyStyle={{ padding: 20 }}
      >
        {/* Thống kê */}
        <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
          <Col xs={24} sm={12} md={6}>
            <div className="stat-card">
              <Statistic
                title="Tổng đơn hàng"
                value={stats.totalOrders}
                prefix={<ShoppingCartOutlined style={{ color: "#00A86B" }} />}
                valueStyle={{ color: "#1f2937" }}
              />
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="stat-card">
              <Statistic
                title="Đang chờ"
                value={stats.pending}
                prefix={<ClockCircleOutlined style={{ color: "#f59e0b" }} />}
                valueStyle={{ color: "#1f2937" }}
              />
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="stat-card">
              <Statistic
                title="Đã hoàn thành"
                value={stats.completed}
                prefix={<CheckCircleOutlined style={{ color: "#00A86B" }} />}
                valueStyle={{ color: "#1f2937" }}
              />
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="stat-card">
              <Statistic
                title="Tổng giá trị"
                value={stats.total}
                prefix={<DollarOutlined style={{ color: "#00A86B" }} />}
                formatter={(value) => fmtVND(value)}
                valueStyle={{ color: "#1f2937" }}
              />
            </div>
          </Col>
        </Row>

        {/* Toolbar */}
        <Space style={{ marginBottom: 16 }} wrap>
          <Input
            className="search-input"
            allowClear
            prefix={<SearchOutlined style={{ color: "#00A86B" }} />}
            placeholder="Tìm kiếm theo tên sản phẩm…"
            style={{ width: 400 }}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Tooltip title="Tải lại">
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={() => load(buyerId)}
              style={{
                background: "#00A86B",
                borderColor: "#00A86B",
              }}
            >
              Tải lại
            </Button>
          </Tooltip>
        </Space>

        {/* Table */}
        {loading ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : (
          <div className="orders-table">
            <Table
              rowKey={(r) => r.id}
              columns={columns}
              dataSource={filtered}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} đơn hàng`,
              }}
              scroll={{ x: 900 }}
              locale={{ emptyText: "Chưa có đơn hàng nào" }}
              summary={(data) => {
                const total = data.reduce(
                  (acc, r) => acc + Number(r.offeredPrice || 0),
                  0
                );
                return (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={3}>
                      <Text strong style={{ color: "#1f2937" }}>
                        Tổng giá trị
                      </Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={3} align="right">
                      <Text strong style={{ color: "#00A86B", fontSize: 16 }}>
                        {fmtVND(total)}
                      </Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={4} />
                    <Table.Summary.Cell index={5} />
                  </Table.Summary.Row>
                );
              }}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
