// src/components/complaints/ComplaintForm.jsx
import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Upload,
  Button,
  message,
  Space,
  Alert,
  Spin,
} from "antd";
import { UploadOutlined, PlusOutlined } from "@ant-design/icons";
import complaintService from "../../services/complaintService";
import contractService from "../../services/contractService";

const { TextArea } = Input;

const ComplaintForm = ({ visible, onClose, onSuccess, userId }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [contracts, setContracts] = useState([]);
  const [loadingContracts, setLoadingContracts] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  // Load completed contracts
  useEffect(() => {
    if (visible && userId) {
      loadCompletedContracts();
    } else {
      setContracts([]);
    }
  }, [visible, userId]);

  const loadCompletedContracts = async () => {
    setLoadingContracts(true);
    try {
      const result = await contractService.getContractsByUser(userId);
      if (result.success && result.data) {
        // Filter only completed contracts with deliveryCompleted = true
        const completed = result.data.filter(
          (contract) =>
            contract.status === "COMPLETED" &&
            contract.deliveryCompleted === true
        );
        setContracts(completed);
      } else {
        message.warning("Không thể tải danh sách hợp đồng");
      }
    } catch (error) {
      console.error("Error loading contracts:", error);
      message.error("Lỗi khi tải danh sách hợp đồng");
    } finally {
      setLoadingContracts(false);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const complaintData = {
        contractId: values.contractId,
        title: values.title,
        description: values.description,
        category: values.category,
        evidenceImages: fileList.map((file) => file.originFileObj),
      };

      const result = await complaintService.createComplaint(complaintData);
      if (result.success) {
        message.success(result.message || "Tạo khiếu nại thành công");
        form.resetFields();
        setFileList([]);
        onSuccess?.();
        onClose();
      } else {
        message.error(result.message || "Không thể tạo khiếu nại");
      }
    } catch (error) {
      console.error("Error creating complaint:", error);
      message.error("Lỗi khi tạo khiếu nại");
    } finally {
      setLoading(false);
    }
  };

  const uploadProps = {
    beforeUpload: (file) => {
      const isJpgOrPng =
        file.type === "image/jpeg" ||
        file.type === "image/png" ||
        file.type === "image/jpg";
      if (!isJpgOrPng) {
        message.error("Chỉ chấp nhận file ảnh JPG/PNG!");
        return Upload.LIST_IGNORE;
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error("Ảnh phải nhỏ hơn 5MB!");
        return Upload.LIST_IGNORE;
      }
      return false;
    },
    onChange: ({ fileList: newFileList }) => {
      setFileList(newFileList);
    },
    listType: "picture-card",
    fileList,
    onPreview: async (file) => {
      if (!file.url && !file.preview) {
        file.preview = await getBase64(file.originFileObj);
      }
      setPreviewImage(file.url || file.preview);
      setPreviewVisible(true);
    },
    multiple: true,
  };

  const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const handleCancel = () => {
    form.resetFields();
    setFileList([]);
    onClose();
  };

  return (
    <Modal
      title="Tạo khiếu nại mới"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={700}
    >
      {loadingContracts ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Spin size="large" tip="Đang tải danh sách hợp đồng..." />
        </div>
      ) : contracts.length === 0 ? (
        <Alert
          message="Không có hợp đồng nào để khiếu nại"
          description="Bạn chỉ có thể tạo khiếu nại cho các hợp đồng đã hoàn thành giao hàng."
          type="info"
          showIcon
        />
      ) : (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            category: undefined,
          }}
        >
          <Form.Item
            label="Chọn hợp đồng"
            name="contractId"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn hợp đồng",
              },
            ]}
          >
            <Select placeholder="Chọn hợp đồng">
              {contracts.map((contract) => (
                <Select.Option key={contract.id} value={contract.id}>
                  {contract.contractCode} - {contract.productName} (Giá:{" "}
                  {contract.agreedPrice?.toLocaleString("vi-VN")} VNĐ)
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Loại khiếu nại"
            name="category"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn loại khiếu nại",
              },
            ]}
          >
            <Select placeholder="Chọn loại khiếu nại">
              <Select.Option value="PRODUCT_QUALITY">
                Chất lượng sản phẩm
              </Select.Option>
              <Select.Option value="DAMAGED_ITEM">Hàng bị hư hỏng</Select.Option>
              <Select.Option value="NOT_AS_DESCRIBED">
                Không đúng mô tả
              </Select.Option>
              <Select.Option value="OTHER">Khác</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Tiêu đề"
            name="title"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập tiêu đề",
              },
              {
                max: 255,
                message: "Tiêu đề không được vượt quá 255 ký tự",
              },
            ]}
          >
            <Input placeholder="Nhập tiêu đề khiếu nại" />
          </Form.Item>

          <Form.Item
            label="Mô tả chi tiết"
            name="description"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập mô tả chi tiết",
              },
              {
                max: 2000,
                message: "Mô tả không được vượt quá 2000 ký tự",
              },
            ]}
          >
            <TextArea
              rows={6}
              placeholder="Mô tả chi tiết về vấn đề bạn gặp phải..."
              maxLength={2000}
              showCount
            />
          </Form.Item>

          <Form.Item
            label="Ảnh minh chứng"
            name="evidenceImages"
            extra="Tải lên ảnh minh chứng cho khiếu nại của bạn (JPG/PNG, tối đa 5MB/ảnh)"
          >
            <Upload {...uploadProps}>
              {fileList.length >= 8 ? null : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Tải lên</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Form.Item>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button onClick={handleCancel}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Gửi khiếu nại
              </Button>
            </Space>
          </Form.Item>
        </Form>
      )}
      
      {previewVisible && (
        <Modal
          open={previewVisible}
          footer={null}
          onCancel={() => setPreviewVisible(false)}
        >
          <img alt="preview" style={{ width: "100%" }} src={previewImage} />
        </Modal>
      )}
    </Modal>
  );
};

export default ComplaintForm;

