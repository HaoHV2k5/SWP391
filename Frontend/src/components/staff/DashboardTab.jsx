// src/components/staff/DashboardTab.jsx
import React, { useMemo, useState } from "react";
import { Card, Input, Tabs, Table, Tag } from "antd";
import {
  usePendingProducts,
  usePendingKyc,
  usePendingComplaints,
} from "../../hooks/useStaff";
import { vnDate, statusTag, money } from "../../utils/staffUtils";

const DashboardTab = () => {
  const pro = usePendingProducts();
  const kyc = usePendingKyc();
  const cmp = usePendingComplaints(); // nếu chưa có API complaint, có thể ẩn tab này

  const [q, setQ] = useState("");

  const filter = (arr) => {
    if (!q.trim()) return arr;
    const t = q.toLowerCase();
    return arr.filter((x) => JSON.stringify(x).toLowerCase().includes(t));
  };

  const colsProducts = useMemo(
    () => [
      {
        title: "ID",
        dataIndex: "id",
        key: "id",
        width: 80,
        render: (v) => `#${v}`,
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
        width: 80,
        render: (v) => `#${v}`,
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
        width: 80,
        render: (v) => `#${v}`,
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

  return (
    <div>
      <Card style={{ marginBottom: 12 }}>
        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div>
            <b>Tin PENDING:</b> {pro.list.length}
          </div>
          <div>
            <b>KYC PENDING:</b> {kyc.list.length}
          </div>
          <div>
            <b>Complaint PENDING:</b> {cmp.list.length}
          </div>
          <Input.Search
            placeholder="Tìm kiếm mọi thứ…"
            style={{ maxWidth: 340, marginLeft: "auto" }}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </Card>

      <Tabs
        items={[
          {
            key: "products",
            label: `Tin đăng (${pro.list.length})`,
            children: (
              <Table
                rowKey="id"
                loading={pro.initial}
                columns={colsProducts}
                dataSource={filter(pro.list)}
                pagination={{ pageSize: 8 }}
              />
            ),
          },
          {
            key: "kyc",
            label: `KYC (${kyc.list.length})`,
            children: (
              <Table
                rowKey="id"
                loading={kyc.initial}
                columns={colsKyc}
                dataSource={filter(kyc.list)}
                pagination={{ pageSize: 8 }}
              />
            ),
          },
          {
            key: "complaints",
            label: `Khiếu nại (${cmp.list.length})`,
            children: (
              <Table
                rowKey="id"
                loading={cmp.initial}
                columns={colsCmp}
                dataSource={filter(cmp.list)}
                pagination={{ pageSize: 8 }}
              />
            ),
          },
        ]}
      />
    </div>
  );
};

export default DashboardTab;
