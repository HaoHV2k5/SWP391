// src/components/staff/DashboardTab.jsx
import React, { useMemo } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Table,
  Tag,
  Skeleton,
  Empty,
  Divider,
  Tooltip,
} from "antd";
import {
  FileTextOutlined,
  UserOutlined,
  CheckCircleTwoTone,
  ExclamationCircleTwoTone,
  CloseCircleTwoTone,
} from "@ant-design/icons";
import {
  formatDate,
  formatCurrency,
  getStatusColor,
  getStatusText,
} from "../../utils/staffUtils";

/** Ép dữ liệu về mảng an toàn để không văng lỗi khi BE trả khác format */
const toArray = (data) => {
  if (Array.isArray(data)) return data;
  if (data?.items && Array.isArray(data.items)) return data.items;
  if (data?.content && Array.isArray(data.content)) return data.content;
  if (data?.data && Array.isArray(data.data)) return data.data;
  return [];
};

const SafeNumber = (n) => (Number.isFinite(n) ? n : 0);

const DashboardTab = ({ stats, products, kycList, complaints }) => {
  const productsArr = toArray(products);
  const kycArr = toArray(kycList);
  const complaintArr = toArray(complaints);

  // Nếu BE chưa có endpoint tổng quan, tự tính trên 2 list products + kyc
  const computed = useMemo(() => {
    const pTotal = productsArr.length;
    const pPending = productsArr.filter(
      (p) => (p.status || "").toUpperCase() === "PENDING"
    ).length;
    const pApproved = productsArr.filter((p) =>
      ["STAFF_APPROVED", "ADMIN_APPROVED"].includes(
        (p.status || "").toUpperCase()
      )
    ).length;
    const pRejected = productsArr.filter(
      (p) => (p.status || "").toUpperCase() === "REJECTED"
    ).length;

    const kTotal = kycArr.length;
    const kPending = kycArr.filter(
      (k) => (k.status || "").toUpperCase() === "PENDING"
    ).length;
    const kApproved = kycArr.filter((k) =>
      ["STAFF_APPROVED", "ADMIN_APPROVED"].includes(
        (k.status || "").toUpperCase()
      )
    ).length;

    return {
      totalProducts: stats?.totalProducts ?? pTotal,
      pendingProducts: stats?.pendingProducts ?? pPending,
      approvedProducts: stats?.approvedProducts ?? pApproved,
      rejectedProducts: stats?.rejectedProducts ?? pRejected,

      totalKyc: stats?.totalKyc ?? kTotal,
      pendingKyc: stats?.pendingKyc ?? kPending,
      approvedKyc: stats?.approvedKyc ?? kApproved,

      complaints: complaintArr.length,
    };
  }, [stats, productsArr, kycArr, complaintArr]);

  const loading = !stats && productsArr.length === 0 && kycArr.length === 0;

  const pDonePercent = useMemo(() => {
    const total =
      SafeNumber(computed.approvedProducts) +
      SafeNumber(computed.pendingProducts) +
      SafeNumber(computed.rejectedProducts);
    if (!total) return 0;
    return Math.round((SafeNumber(computed.approvedProducts) / total) * 100);
  }, [computed]);

  const kDonePercent = useMemo(() => {
    const total =
      SafeNumber(computed.approvedKyc) + SafeNumber(computed.pendingKyc);
    if (!total) return 0;
    return Math.round((SafeNumber(computed.approvedKyc) / total) * 100);
  }, [computed]);

  const recentProducts = useMemo(
    () =>
      productsArr
        .slice(0, 8)
        .map((p) => ({ ...p, key: p.id }))
        .sort(
          (a, b) =>
            new Date(b.created_at || b.createdAt || 0) -
            new Date(a.created_at || a.createdAt || 0)
        ),
    [productsArr]
  );

  const recentKyc = useMemo(
    () =>
      kycArr
        .slice(0, 8)
        .map((k) => ({ ...k, key: k.id }))
        .sort(
          (a, b) =>
            new Date(b.submittedAt || b.createdAt || 0) -
            new Date(a.submittedAt || a.createdAt || 0)
        ),
    [kycArr]
  );

  const productCols = [
    { title: "ID", dataIndex: "id", width: 80, render: (v) => `#${v}` },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      render: (t, r) => (
        <div>
          <div style={{ fontWeight: 600 }}>{t || r.name || "N/A"}</div>
          <div style={{ color: "#888", fontSize: 12 }}>
            {(r.description || "").slice(0, 80)}
          </div>
        </div>
      ),
    },
    {
      title: "Người bán",
      render: (_, r) =>
        r.sellerName ||
        r.seller?.fullName ||
        r.user?.fullName ||
        r.createdBy?.fullName ||
        r._seller?.fullName ||
        r._seller?.fullname ||
        "N/A",
    },
    {
      title: "Giá",
      dataIndex: "price",
      width: 140,
      render: (p) => formatCurrency(p || 0),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: 140,
      render: (s) => <Tag color={getStatusColor(s)}>{getStatusText(s)}</Tag>,
    },
    {
      title: "Ngày",
      dataIndex: "created_at",
      width: 160,
      render: (d, r) => formatDate(d || r.createdAt),
    },
  ];

  const kycCols = [
    { title: "ID", dataIndex: "id", width: 80, render: (v) => `#${v}` },
    {
      title: "Họ tên",
      render: (_, r) => r.fullName || r.fullname || r.name || "N/A",
    },
    { title: "Email", dataIndex: "email" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: 140,
      render: (s) => <Tag color={getStatusColor(s)}>{getStatusText(s)}</Tag>,
    },
    {
      title: "Ngày nộp",
      dataIndex: "submittedAt",
      width: 160,
      render: (d, r) => formatDate(d || r.createdAt),
    },
  ];

  return (
    <div style={{ padding: 8 }}>
      {/* KPI Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card className="staff-card">
            <Row align="middle" gutter={12}>
              <Col flex="32px">
                <FileTextOutlined style={{ fontSize: 28 }} />
              </Col>
              <Col flex="auto">
                <div style={{ color: "#aaa" }}>Tổng số tin đăng</div>
                <Statistic value={SafeNumber(computed.totalProducts)} />
              </Col>
            </Row>
            <Divider style={{ margin: "12px 0" }} />
            <Row gutter={12}>
              <Col span={8}>
                <Tooltip title="Đã duyệt">
                  <div style={{ color: "#aaa" }}>Đã duyệt</div>
                  <div style={{ fontWeight: 700 }}>
                    {SafeNumber(computed.approvedProducts)}
                  </div>
                </Tooltip>
              </Col>
              <Col span={8}>
                <Tooltip title="Chờ duyệt">
                  <div style={{ color: "#aaa" }}>Chờ duyệt</div>
                  <div style={{ fontWeight: 700 }}>
                    {SafeNumber(computed.pendingProducts)}
                  </div>
                </Tooltip>
              </Col>
              <Col span={8}>
                <Tooltip title="Từ chối">
                  <div style={{ color: "#aaa" }}>Từ chối</div>
                  <div style={{ fontWeight: 700 }}>
                    {SafeNumber(computed.rejectedProducts)}
                  </div>
                </Tooltip>
              </Col>
            </Row>
            <div style={{ marginTop: 12 }}>
              <div style={{ marginBottom: 4, color: "#aaa" }}>
                Hoàn tất duyệt tin
              </div>
              <Progress percent={pDonePercent} status="active" />
            </div>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card className="staff-card">
            <Row align="middle" gutter={12}>
              <Col flex="32px">
                <UserOutlined style={{ fontSize: 28 }} />
              </Col>
              <Col flex="auto">
                <div style={{ color: "#aaa" }}>Tổng số KYC</div>
                <Statistic value={SafeNumber(computed.totalKyc)} />
              </Col>
            </Row>
            <Divider style={{ margin: "12px 0" }} />
            <Row gutter={12}>
              <Col span={12}>
                <Tooltip title="Đã duyệt">
                  <div style={{ color: "#aaa" }}>Đã duyệt</div>
                  <div style={{ fontWeight: 700 }}>
                    {SafeNumber(computed.approvedKyc)}
                  </div>
                </Tooltip>
              </Col>
              <Col span={12}>
                <Tooltip title="Chờ duyệt">
                  <div style={{ color: "#aaa" }}>Chờ duyệt</div>
                  <div style={{ fontWeight: 700 }}>
                    {SafeNumber(computed.pendingKyc)}
                  </div>
                </Tooltip>
              </Col>
            </Row>
            <div style={{ marginTop: 12 }}>
              <div style={{ marginBottom: 4, color: "#aaa" }}>
                Hoàn tất duyệt KYC
              </div>
              <Progress percent={kDonePercent} status="active" />
            </div>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card className="staff-card">
            <Row align="middle" gutter={12}>
              <Col flex="32px">
                <ExclamationCircleTwoTone
                  twoToneColor="#faad14"
                  style={{ fontSize: 28 }}
                />
              </Col>
              <Col flex="auto">
                <div style={{ color: "#aaa" }}>Khiếu nại</div>
                <Statistic value={SafeNumber(computed.complaints)} />
              </Col>
            </Row>
            <Divider style={{ margin: "12px 0" }} />
            <div style={{ display: "flex", gap: 12 }}>
              <Tag
                icon={<CheckCircleTwoTone twoToneColor="#52c41a" />}
                color="success"
              >
                Resolved
              </Tag>
              <Tag
                icon={<ExclamationCircleTwoTone twoToneColor="#faad14" />}
                color="warning"
              >
                Open
              </Tag>
              <Tag
                icon={<CloseCircleTwoTone twoToneColor="#ff4d4f" />}
                color="error"
              >
                Rejected
              </Tag>
            </div>
            <div style={{ color: "#aaa", marginTop: 8, fontSize: 12 }}>
              * Nếu BE chưa có API khiếu nại, ô này sẽ luôn là 0.
            </div>
          </Card>
        </Col>
      </Row>

      {/* Recent tables */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={14}>
          <Card title="Tin đăng gần đây" className="staff-card">
            {loading ? (
              <Skeleton active paragraph={{ rows: 6 }} />
            ) : productsArr.length ? (
              <Table
                dataSource={recentProducts}
                columns={productCols}
                rowKey="id"
                pagination={{ pageSize: 5 }}
              />
            ) : (
              <Empty description="Chưa có tin đăng" />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card title="KYC gần đây" className="staff-card">
            {loading ? (
              <Skeleton active paragraph={{ rows: 6 }} />
            ) : kycArr.length ? (
              <Table
                dataSource={recentKyc}
                columns={kycCols}
                rowKey="id"
                pagination={{ pageSize: 5 }}
              />
            ) : (
              <Empty description="Chưa có hồ sơ KYC" />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardTab;
