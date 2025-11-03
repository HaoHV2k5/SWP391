// src/components/staff/DashboardTab.jsx
import React, { useMemo, useState } from "react";
import {
  Card,
  Input,
  Tabs,
  Table,
  Tag,
  Row,
  Col,
  Space,
  Tooltip,
  Badge,
} from "antd";
import {
  AppstoreOutlined,
  IdcardOutlined,
  AlertOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  usePendingProducts,
  usePendingKyc,
  usePendingComplaints,
} from "../../hooks/useStaff";
import { vnDate, statusTag, money } from "../../utils/staffUtils";

// ---- small stat card (UI only) ---------------------------------------------
const StatCard = ({ icon, label, value }) => (
  <Card
    bordered={false}
    bodyStyle={{ padding: 18 }}
    style={{
      height: "100%",
      borderRadius: 14,
      background:
        "linear-gradient(180deg, rgba(25,31,55,.9) 0%, rgba(20,24,40,.9) 100%)",
      boxShadow:
        "0 10px 24px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.04)",
      border: "1px solid rgba(255,255,255,.06)",
      color: "#fff",
    }}
  >
    <Space size={14} align="center">
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          display: "grid",
          placeItems: "center",
          background: "rgba(99,102,241,.18)",
          border: "1px solid rgba(99,102,241,.35)",
          color: "#aab0ff",
          fontSize: 20,
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 12, opacity: 0.8 }}>{label}</div>
        <div style={{ fontSize: 22, fontWeight: 700 }}>{value}</div>
      </div>
    </Space>
  </Card>
);

const DashboardTab = () => {
  const pro = usePendingProducts();
  const kyc = usePendingKyc();
  const cmp = usePendingComplaints(); // nếu chưa có API complaint, có thể ẩn tab này

  const [q, setQ] = useState("");

  const filterPro = (arr) => {
    if (!q.trim()) return arr;
    const t = q.toLowerCase();
    return arr.filter((x) =>
      JSON.stringify(x?.title).toLowerCase().includes(t)
    );
  };

  const filterKyc = (arr) => {
    if (!q.trim()) return arr;
    const t = q.toLowerCase();
    return arr.filter((x) =>
      JSON.stringify(x?.userId).toLowerCase().includes(t)
    );
  };

  // -------------------- columns: GIỮ NGUYÊN LOGIC ---------------------------
  const colsProducts = useMemo(
    () => [
      {
        title: "ID",
        dataIndex: "id",
        key: "id",
        width: 90,
        render: (v) => <span style={{ color: "#a3bffa" }}>#{v}</span>,
      },
      { title: "Tiêu đề", dataIndex: "title", key: "title" },
      {
        title: "Giá",
        key: "price",
        render: (_, r) => money(r.price || r.amount || r.cost),
      },
      {
        title: "Gửi lúc",
        key: "createdAt",
        render: (_, r) => vnDate(r.createdAt || r.created_at),
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        render: (s) => (
          <Tag color={statusTag(s).color}>{statusTag(s).text}</Tag>
        ),
      },
    ],
    []
  );

  const colsKyc = useMemo(
    () => [
      {
        title: "ID",
        dataIndex: "id",
        key: "id",
        width: 90,
        render: (v) => <span style={{ color: "#facca3ff" }}>#{v}</span>,
      },
      { title: "User ID", dataIndex: "userId", key: "userId" },
      {
        title: "Gửi lúc",
        key: "createdAt",
        render: (_, r) => vnDate(r.createdAt || r.created_at),
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        render: (s) => (
          <Tag color={statusTag(s).color}>{statusTag(s).text}</Tag>
        ),
      },
    ],
    []
  );

  const colsCmp = useMemo(
    () => [
      {
        title: "ID",
        dataIndex: "id",
        key: "id",
        width: 90,
        render: (v) => <span style={{ color: "#a3bffa" }}>#{v}</span>,
      },
      {
        title: "Người mua",
        dataIndex: "buyer",
        key: "buyer",
        render: (v, r) => r?.buyer?.username || r?.buyerName || "—",
      },
      {
        title: "Nội dung",
        dataIndex: "content",
        key: "content",
        ellipsis: true,
      },
      {
        title: "Gửi lúc",
        key: "createdAt",
        render: (_, r) => vnDate(r.createdAt || r.created_at),
      },
    ],
    []
  );

  // ------------------------------ UI ----------------------------------------
  return (
    <div
      style={{
        padding: 8,
        background:
          "radial-gradient(1200px 600px at 0% 0%, #0f1630 0%, #0c1227 35%, #0a1122 70%, #09101e 100%)",
        borderRadius: 16,
      }}
    >
      {/* CSS override nho nhỏ cho giao diện dark */}
      <style>{`
        .glass-card {
          background: linear-gradient(180deg, rgba(17,23,40,.78) 0%, rgba(14,18,32,.78) 100%);
          border: 1px solid rgba(255,255,255,.06);
          border-radius: 16px !important;
          box-shadow: 0 10px 24px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.04);
          color: #e8ecff;
        }
        .dark-tabs > .ant-tabs-nav {
          margin: 0 0 12px 0;
        }
        .dark-tabs .ant-tabs-tab {
          color:#c9d1ff;
        }
        .dark-tabs .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
          color:#fff;
          text-shadow: 0 0 8px rgba(99,102,241,.6);
        }
        .dark-tabs .ant-tabs-ink-bar { background:#6366f1; }

        .dark-table .ant-table {
          background: transparent;
          color: #dfe3ff;
        }
        .dark-table .ant-table-thead > tr > th {
          background: rgba(255,255,255,.04) !important;
          color: #c9d1ff;
          border-bottom: 1px solid rgba(255,255,255,.08);
        }
        .dark-table .ant-table-tbody > tr > td {
          background: transparent;
          border-bottom: 1px solid rgba(255,255,255,.06);
          transition: all 0.2s ease;
        }
        .dark-table .ant-table-tbody > tr:hover > td {
          background: rgba(99, 102, 241, 0.15) !important;
          color: #ffffff !important;
        }
        .dark-table .ant-table-tbody > tr:hover > td span[style*="color"] {
          opacity: 1 !important;
        }
        .dark-table .ant-table-tbody > tr {
          transition: all 0.2s ease;
        }
        .dark-table .ant-table-tbody > tr:hover {
          transform: translateX(2px);
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.15);
        }
        .dark-table .ant-pagination .ant-pagination-item-active {
          border-color:#6366f1;
        }
        .toolbar-input .ant-input,
        .toolbar-input .ant-input-affix-wrapper {
          background: rgba(255,255,255,.06);
          border-color: rgba(255,255,255,.1);
          color: #fff;
        }
        .toolbar-input .ant-input::placeholder { color: #98a0cb; }
      `}</style>

      {/* HEADER: Stat cards + search */}
      <Card
        bordered={false}
        className="glass-card"
        bodyStyle={{ padding: 16 }}
        style={{ marginBottom: 14 }}
      >
        <Row gutter={[14, 14]} align="middle">
          <Col xs={24} md={18}>
            <Row gutter={[14, 14]}>
              <Col xs={24} md={8}>
                <StatCard
                  icon={<AppstoreOutlined />}
                  label="Tin PENDING"
                  value={pro.list.length}
                />
              </Col>
              <Col xs={24} md={8}>
                <StatCard
                  icon={<IdcardOutlined />}
                  label="KYC PENDING"
                  value={kyc.list.length}
                />
              </Col>
            </Row>
          </Col>

          <Col xs={24} md={6}>
            <Tooltip title="Tìm Kiếm">
              <Input
                allowClear
                prefix={<SearchOutlined />}
                placeholder="Tìm Kiếm..."
                className="toolbar-input"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </Tooltip>
          </Col>
        </Row>
      </Card>

      {/* CONTENT: Tabs + Tables (logic giữ nguyên) */}
      <Card bordered={false} className="glass-card" bodyStyle={{ padding: 16 }}>
        <Tabs
          className="dark-tabs"
          defaultActiveKey="products"
          items={[
            {
              key: "products",
              label: (
                <Badge count={pro.list.length} size="small" color="#6366f1">
                  <span style={{ paddingRight: 8, color: "white" }}>
                    Tin đăng
                  </span>
                </Badge>
              ),
              children: (
                <div className="dark-table">
                  <Table
                    rowKey="id"
                    loading={pro.initial}
                    columns={colsProducts}
                    dataSource={filterPro(pro.list)}
                    pagination={{ pageSize: 8 }}
                  />
                </div>
              ),
            },
            {
              key: "kyc",
              label: (
                <Badge count={kyc.list.length} size="small" color="#22d3ee">
                  <span style={{ paddingRight: 8, color: "white" }}>KYC</span>
                </Badge>
              ),
              children: (
                <div className="dark-table">
                  <Table
                    rowKey="id"
                    loading={kyc.initial}
                    columns={colsKyc}
                    dataSource={filterKyc(kyc.list)}
                    pagination={{ pageSize: 8 }}
                  />
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default DashboardTab;
