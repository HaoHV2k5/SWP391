// src/pages/OrdersBought.jsx
import React, { useEffect, useMemo, useState } from "react";
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
} from "antd";
import { ReloadOutlined, SearchOutlined } from "@ant-design/icons";
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

export default function OrdersBought({ defaultBuyerId = 26 }) {
  const [buyerId, setBuyerId] = useState(String(defaultBuyerId));
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState("");

  const load = async (id) => {
    if (!id) {
      message.warning("Nhập buyerId");
      return;
    }
    try {
      setLoading(true);
      // ✅ Sửa bug: Dùng id động thay vì hardcode 26
      const res = await memberService.getBoughtOrders(Number(id));
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

  useEffect(() => {
    // ✅ Sửa bug: Dùng buyerId từ state thay vì hardcode 26
    if (buyerId) {
      load(buyerId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        String(r.id ?? "").includes(q) ||
        String(r.productName ?? "")
          .toLowerCase()
          .includes(q) ||
        String(r.sellerName ?? "")
          .toLowerCase()
          .includes(q) ||
        String(r.status ?? "")
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
      render: (v) => <Text strong>#{v}</Text>,
    },
    {
      title: "Product",
      dataIndex: "productName",
      ellipsis: true,
      render: (v, r) => (
        <Space direction="vertical" size={2}>
          <Text strong ellipsis={{ tooltip: v || "—" }}>
            {v || "—"}
          </Text>
          <Text type="secondary">Product ID: {r.productId ?? "—"}</Text>
        </Space>
      ),
    },
    {
      title: "Seller",
      dataIndex: "sellerName",
      width: 220,
      render: (v) => <Text ellipsis={{ tooltip: v || "—" }}>{v || "—"}</Text>,
    },
    {
      title: "Offered Price",
      dataIndex: "offeredPrice",
      width: 160,
      align: "right",
      render: (v) => <Text strong>{fmtVND(v)}</Text>,
      sorter: (a, b) =>
        Number(a.offeredPrice || 0) - Number(b.offeredPrice || 0),
    },
    {
      title: "Status",
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
      render: (s) => <Tag color={STATUS_COLOR[s] ?? "default"}>{s || "—"}</Tag>,
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      width: 200,
      sorter: (a, b) =>
        (parseIsoLocal(a.createdAt)?.getTime() || 0) -
        (parseIsoLocal(b.createdAt)?.getTime() || 0),
      defaultSortOrder: "descend",
      render: (v) => <Text>{fmtDate(v)}</Text>,
    },
  ];

  return (
    <Card
      title={
        <Title level={4} style={{ margin: 0 }}>
          Đơn đã mua
        </Title>
      }
      bodyStyle={{ padding: 16 }}
    >
      <Space style={{ marginBottom: 12 }} wrap>
        <Input
          placeholder="Nhập buyerId…"
          style={{ width: 220 }}
          value={buyerId}
          onChange={(e) => setBuyerId(e.target.value)}
          onPressEnter={() => load(buyerId)}
        />
        <Button type="primary" onClick={() => load(buyerId)}>
          Tải danh sách
        </Button>

        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="Tìm theo sản phẩm / người bán / trạng thái…"
          style={{ width: 360 }}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Tooltip title="Reload">
          <Button icon={<ReloadOutlined />} onClick={() => load(buyerId)} />
        </Tooltip>
      </Space>

      {loading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : (
        <Table
          rowKey={(r) => r.id}
          columns={columns}
          dataSource={filtered}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          scroll={{ x: 900 }}
          summary={(data) => {
            const total = data.reduce(
              (acc, r) => acc + Number(r.offeredPrice || 0),
              0
            );
            return (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={3}>
                  <Text strong>Tổng Offered</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3} align="right">
                  <Text strong>{fmtVND(total)}</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4} />
                <Table.Summary.Cell index={5} />
              </Table.Summary.Row>
            );
          }}
        />
      )}
    </Card>
  );
}
