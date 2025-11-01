// src/components/staff/ComplaintResolveModal.jsx
import React, { useState } from "react";
import {
  Modal,
  Form,
  Select,
  Input,
  Button,
  message,
  Space,
} from "antd";
import complaintService from "../../services/complaintService";

const { TextArea } = Input;

const ComplaintResolveModal = ({ visible, complaint, onClose }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    if (!complaint) return;

    setLoading(true);
    try {
      const result = await complaintService.resolveComplaint(
        complaint.id,
        values
      );
      if (result.success) {
        message.success(result.message || "Giải quyết complaint thành công");
        onClose();
      } else {
        message.error(result.message || "Không thể giải quyết complaint");
      }
    } catch (error) {
      console.error("Error resolving complaint:", error);
      message.error("Lỗi khi giải quyết complaint");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Giải quyết khiếu nại"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          status: undefined,
          staffNotes: "",
        }}
      >
        <Form.Item
          label="Quyết định"
          name="status"
          rules={[
            {
              required: true,
              message: "Vui lòng chọn quyết định",
            },
          ]}
        >
          <Select placeholder="Chọn quyết định">
            <Select.Option value="RESOLVED_BUYER_FAVOR">
              Giải quyết theo hướng có lợi cho Buyer
            </Select.Option>
            <Select.Option value="RESOLVED_SELLER_FAVOR">
              Giải quyết theo hướng có lợi cho Seller
            </Select.Option>
            <Select.Option value="CLOSED">Đóng complaint</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Ghi chú"
          name="staffNotes"
          rules={[
            {
              max: 2000,
              message: "Ghi chú không được quá 2000 ký tự",
            },
          ]}
        >
          <TextArea
            rows={6}
            placeholder="Nhập ghi chú về quyết định này..."
            maxLength={2000}
            showCount
          />
        </Form.Item>

        <Form.Item>
          <Space style={{ width: "100%", justifyContent: "flex-end" }}>
            <Button onClick={onClose}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Xác nhận
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ComplaintResolveModal;

