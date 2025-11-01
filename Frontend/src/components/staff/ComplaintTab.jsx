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
  Modal,
  message,
  Tooltip,
} from "antd";
import {
  EyeOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  formatDate,
  vnDate,
} from "../../utils/staffUtils";
import complaintService from "../../services/complaintService";
import ComplaintDetailModal from "./ComplaintDetailModal";
import ComplaintResolveModal from "./ComplaintResolveModal";

const ComplaintTab = () => {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [resolveVisible, setResolveVisible] = useState(false);

  // Load danh sách complaints
  const load = async () => {
    setLoading(true);
    try {
      const result = await complaintService.getAllComplaints();
      if (result.success) {
        setRows(result.data || []);
      } else {
        message.error(result.message || "Không thể tải danh sách khiếu nại");
        setRows([]);
      }
    } catch (error) {
      console.error("Error loading complaints:", error);
      message.error("Lỗi khi tải danh sách khiếu nại");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Filter complaints by status
  const filteredRows = rows.filter((row) => {
    if (status !== "all" && row.status !== status) return false;
    if (q && !row.title?.toLowerCase().includes(q.toLowerCase()) && 
        !row.description?.toLowerCase().includes(q.toLowerCase()) &&
        !row.buyerName?.toLowerCase().includes(q.toLowerCase()) &&
        !row.sellerName?.toLowerCase().includes(q.toLowerCase())) {
      return false;
    }
    return true;
  });

  // Get status tag info
  const getStatusTag = (status) => {
    const statusMap = {
      PENDING: { color: "gold", text: "Chờ xử lý" },
      UNDER_REVIEW: { color: "processing", text: "Đang xem xét" },
      RESOLVED_BUYER_FAVOR: { color: "green", text: "Giải quyết cho Buyer" },
      RESOLVED_SELLER_FAVOR: { color: "green", text: "Giải quyết cho Seller" },
      CLOSED: { color: "default", text: "Đã đóng" },
    };
    return statusMap[status] || { color: "default", text: status || "—" };
  };

  // Get category text
  const getCategoryText = (category) => {
    const categoryMap = {
      PRODUCT_QUALITY: "Chất lượng sản phẩm",
      DAMAGED_ITEM: "Hàng bị hư hỏng",
      NOT_AS_DESCRIBED: "Không đúng mô tả",
      OTHER: "Khác",
    };
    return categoryMap[category] || category || "—";
  };

  // Handle view details
  const handleViewDetail = (complaint) => {
    setSelectedComplaint(complaint);
    setDetailVisible(true);
  };

  // Handle start review
  const handleStartReview = async (complaint) => {
    try {
      const result = await complaintService.startReview(complaint.id);
      if (result.success) {
        message.success(result.message || "Bắt đầu xem xét thành công");
        load();
      } else {
        message.error(result.message || "Không thể bắt đầu xem xét");
      }
    } catch (error) {
      console.error("Error starting review:", error);
      message.error("Lỗi khi bắt đầu xem xét");
    }
  };

  // Handle resolve
  const handleResolve = (complaint) => {
    setSelectedComplaint(complaint);
    setResolveVisible(true);
  };

  // Handle resolve modal close
  const handleResolveModalClose = () => {
    setResolveVisible(false);
    setSelectedComplaint(null);
    load();
  };

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
      dataIndex: "buyerName",
      key: "buyerName",
      render: (name) => name || "N/A",
    },
    {
      title: "Người bị khiếu nại",
      dataIndex: "sellerName",
      key: "sellerName",
      render: (name) => name || "N/A",
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      ellipsis: true,
    },
    {
      title: "Loại",
      dataIndex: "category",
      key: "category",
      render: (category) => getCategoryText(category),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (s) => {
        const tag = getStatusTag(s);
        return <Tag color={tag.color}>{tag.text}</Tag>;
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (d) => vnDate(d),
      width: 180,
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          {record.status === "PENDING" && (
            <Tooltip title="Bắt đầu xem xét">
              <Button
                type="text"
                icon={<PlayCircleOutlined />}
                onClick={() => handleStartReview(record)}
              />
            </Tooltip>
          )}
          {(record.status === "PENDING" || record.status === "UNDER_REVIEW") && (
            <Tooltip title="Giải quyết">
              <Button
                type="text"
                icon={<CheckCircleOutlined />}
                onClick={() => handleResolve(record)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card
        title="Danh sách khiếu nại"
        extra={
          <Space>
            <Select
              value={status}
              onChange={(v) => setStatus(v)}
              options={[
                { value: "all", label: "Tất cả" },
                { value: "PENDING", label: "Chờ xử lý" },
                { value: "UNDER_REVIEW", label: "Đang xem xét" },
                { value: "RESOLVED_BUYER_FAVOR", label: "Đã giải quyết (Buyer)" },
                { value: "RESOLVED_SELLER_FAVOR", label: "Đã giải quyết (Seller)" },
                { value: "CLOSED", label: "Đã đóng" },
              ]}
              style={{ width: 200 }}
            />
            <Input.Search
              placeholder="Tìm kiếm"
              allowClear
              onSearch={(v) => setQ(v)}
              style={{ width: 250 }}
            />
            <Button icon={<ReloadOutlined />} onClick={load}>
              Làm mới
            </Button>
          </Space>
        }
        style={{ padding: 16 }}
      >
        {loading ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <Spin spinning tip="Đang tải dữ liệu khiếu nại...">
              <div style={{ height: 100 }} />
            </Spin>
          </div>
        ) : (
          <Table
            dataSource={filteredRows}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            locale={{ emptyText: "Không có khiếu nại" }}
          />
        )}
      </Card>

      {/* Complaint Detail Modal */}
      <ComplaintDetailModal
        visible={detailVisible}
        complaint={selectedComplaint}
        onClose={() => {
          setDetailVisible(false);
          setSelectedComplaint(null);
        }}
      />

      {/* Complaint Resolve Modal */}
      <ComplaintResolveModal
        visible={resolveVisible}
        complaint={selectedComplaint}
        onClose={handleResolveModalClose}
      />
    </>
  );
};

export default ComplaintTab;
