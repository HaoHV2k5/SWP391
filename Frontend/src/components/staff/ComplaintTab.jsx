// src/components/staff/ComplaintTab.jsx
import React, { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Card,
  Spin,
  Space,
  Button,
  Input,
  Select,
  Empty,
} from "antd";
import {
  getStatusColor,
  getStatusText,
  formatDate,
} from "../../utils/staffUtils";
import { API_CONFIG } from "../../constants/staffConstants";

const COMPLAINTS_PATH = import.meta.env.VITE_COMPLAINTS_PATH || ""; // ví dụ: /complaints/staff

const ComplaintTab = () => {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("OPEN");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [supported, setSupported] = useState(Boolean(COMPLAINTS_PATH));

  const toArray = (data) => {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.items)) return data.items;
    return [];
  };

  const load = async (params = {}) => {
    if (!COMPLAINTS_PATH) return; // không gọi nếu chưa cấu hình
    setLoading(true);
    try {
      const qs = new URLSearchParams({
        status: params.status || status,
        page: String(params.page || 1),
        pageSize: String(params.pageSize || 10),
        q: params.q ?? q,
      });
      const res = await fetch(
        `${API_CONFIG.BASE_URL}${COMPLAINTS_PATH}?${qs}`,
        {
          headers: {
            Authorization: localStorage.getItem("token")
              ? `Bearer ${localStorage.getItem("token")}`
              : undefined,
          },
        }
      );

      if (!res.ok) {
        setSupported(false);
        setRows([]);
        return;
      }

      const payload = await res.json().catch(() => ({}));
      setRows(toArray(payload));
      setSupported(true);
    } catch {
      setSupported(false);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (COMPLAINTS_PATH) load({});
  }, []);

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      render: (v) => `#${v}`,
    },
    {
      title: "Người khiếu nại",
      dataIndex: "user",
      key: "user",
      render: (_, r) => r.user?.fullName || r.userName || r.user || "N/A",
    },
    { title: "Lý do", dataIndex: "reason", key: "reason" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (s) => <Tag color={getStatusColor(s)}>{getStatusText(s)}</Tag>,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (d) => formatDate(d),
    },
  ];

  return (
    <Card
      title="Danh sách khiếu nại"
      extra={
        supported && (
          <Space>
            <Select
              value={status}
              onChange={(v) => {
                setStatus(v);
                load({ status: v, page: 1 });
              }}
              options={[
                { value: "OPEN", label: "Mở" },
                { value: "INPROGRESS", label: "Đang xử lý" },
                { value: "RESOLVED", label: "Đã xử lý" },
                { value: "REJECTED", label: "Từ chối" },
              ]}
              style={{ width: 160 }}
            />
            <Input.Search
              placeholder="Từ khoá"
              allowClear
              onSearch={(v) => {
                setQ(v);
                load({ q: v, page: 1 });
              }}
            />
            <Button onClick={() => load({})}>Làm mới</Button>
          </Space>
        )
      }
      style={{ padding: 16 }}
    >
      {loading ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <Spin spinning tip="Đang tải dữ liệu khiếu nại...">
            <div style={{ height: 100 }} />
          </Spin>
        </div>
      ) : !supported ? (
        <Empty description="Tính năng khiếu nại chưa khả dụng (BE chưa có API)" />
      ) : (
        <Table
          // luôn truyền mảng
          dataSource={Array.isArray(rows) ? rows : []}
          columns={columns}
          rowKey={(r) => r.id}
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: "Không có khiếu nại" }}
        />
      )}
    </Card>
  );
};

export default ComplaintTab;
