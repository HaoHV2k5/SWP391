// src/components/staff/ComplaintDetailModal.jsx
import React from "react";
import {
  Modal,
  Descriptions,
  Tag,
  Image,
  Typography,
  Divider,
  Empty,
} from "antd";
import { vnDate } from "../../utils/staffUtils";

const { Title, Paragraph } = Typography;

const ComplaintDetailModal = ({ visible, complaint, onClose }) => {
  if (!complaint) return null;

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

  const getCategoryText = (category) => {
    const categoryMap = {
      PRODUCT_QUALITY: "Chất lượng sản phẩm",
      DAMAGED_ITEM: "Hàng bị hư hỏng",
      NOT_AS_DESCRIBED: "Không đúng mô tả",
      OTHER: "Khác",
    };
    return categoryMap[category] || category || "—";
  };

  const statusTag = getStatusTag(complaint.status);

  return (
    <Modal
      title="Chi tiết khiếu nại"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <Descriptions bordered column={2}>
        <Descriptions.Item label="ID">#{complaint.id}</Descriptions.Item>
        <Descriptions.Item label="Trạng thái">
          <Tag color={statusTag.color}>{statusTag.text}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Loại khiếu nại">
          {getCategoryText(complaint.category)}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày tạo">
          {vnDate(complaint.createdAt)}
        </Descriptions.Item>
        <Descriptions.Item label="Người khiếu nại" span={2}>
          <div>
            <div>
              <strong>{complaint.buyerName}</strong>
            </div>
            <div style={{ color: "#666", fontSize: "12px" }}>
              Email: {complaint.buyerEmail}
            </div>
          </div>
        </Descriptions.Item>
        <Descriptions.Item label="Người bị khiếu nại" span={2}>
          <div>
            <div>
              <strong>{complaint.sellerName}</strong>
            </div>
            <div style={{ color: "#666", fontSize: "12px" }}>
              Email: {complaint.sellerEmail}
            </div>
          </div>
        </Descriptions.Item>
        <Descriptions.Item label="Sản phẩm" span={2}>
          <div>
            <div>
              <strong>{complaint.productTitle}</strong>
            </div>
            <div style={{ color: "#666", fontSize: "12px" }}>
              ID: {complaint.productId}
            </div>
          </div>
        </Descriptions.Item>
        <Descriptions.Item label="Hợp đồng" span={2}>
          <div>
            <div>
              <strong>{complaint.contractCode}</strong>
            </div>
            <div style={{ color: "#666", fontSize: "12px" }}>
              ID: {complaint.contractId}
            </div>
          </div>
        </Descriptions.Item>
      </Descriptions>

      <Divider />

      <Title level={5}>Tiêu đề</Title>
      <Paragraph>{complaint.title}</Paragraph>

      <Title level={5}>Mô tả chi tiết</Title>
      <Paragraph>{complaint.description}</Paragraph>

      {complaint.evidenceUrls && complaint.evidenceUrls.length > 0 && (
        <>
          <Title level={5}>Ảnh minh chứng</Title>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {complaint.evidenceUrls.map((url, index) => (
              <Image
                key={index}
                src={url}
                alt={`Evidence ${index + 1}`}
                width={150}
                height={150}
                style={{ objectFit: "cover" }}
                preview
              />
            ))}
          </div>
        </>
      )}

      {complaint.staffNotes && (
        <>
          <Divider />
          <Title level={5}>Ghi chú của nhân viên</Title>
          <Paragraph>{complaint.staffNotes}</Paragraph>
        </>
      )}

      <Descriptions bordered column={2} style={{ marginTop: 16 }}>
        <Descriptions.Item label="Ngày cập nhật">
          {vnDate(complaint.updatedAt)}
        </Descriptions.Item>
        {complaint.resolvedAt && (
          <Descriptions.Item label="Ngày giải quyết">
            {vnDate(complaint.resolvedAt)}
          </Descriptions.Item>
        )}
      </Descriptions>
    </Modal>
  );
};

export default ComplaintDetailModal;

