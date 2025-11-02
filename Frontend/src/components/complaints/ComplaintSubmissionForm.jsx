// src/components/complaints/ComplaintSubmissionForm.jsx
import React, { useState } from "react";
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
} from "antd";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import complaintService from "../../services/complaintService";

const { TextArea } = Input;

const ComplaintSubmissionForm = ({
  visible,
  onClose,
  onSuccess,
  contract,
  role, // 'buyer' or 'seller'
  userId,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  const handleSubmit = async (values) => {
    // Chỉ cho phép buyer tạo khiếu nại
    if (role !== "buyer") {
      message.warning("Tính năng khiếu nại cho người bán đang được phát triển. Vui lòng thử lại sau!");
      return;
    }

    setLoading(true);
    try {
      const complaintData = {
        contractId: contract.id,
        title: values.title,
        description: values.description,
        category: values.category,
        evidenceImages: fileList.map((file) => file.originFileObj),
      };

      // Gọi API tạo khiếu nại cho buyer
      const result = await complaintService.createComplaint(complaintData);
      
      if (result.success) {
        message.success(result.message || "Tạo khiếu nại thành công");
        form.resetFields();
        setFileList([]);
        onSuccess?.();
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

  if (!contract) return null;

  return (
    <>
      <Modal
        title={
          <div>
            <h4 style={{ margin: 0 }}>
              <i className="bi bi-exclamation-triangle-fill me-2" style={{ color: "#ffc107" }}></i>
              Gửi khiếu nại
            </h4>
            <div className="mt-2">
              <Alert
                message={`Hợp đồng: ${contract.contractCode}`}
                description={`${contract.productName} - ${role === "buyer" ? "Bạn là người mua" : "Bạn là người bán"}`}
                type="info"
                showIcon
                style={{ marginBottom: 0 }}
              />
              {role === "seller" && (
                <Alert
                  message="Tính năng đang phát triển"
                  description="Tính năng khiếu nại cho người bán đang được phát triển. Vui lòng thử lại sau!"
                  type="warning"
                  showIcon
                  style={{ marginTop: "10px", marginBottom: 0 }}
                />
              )}
            </div>
          </div>
        }
        open={visible}
        onCancel={handleCancel}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            category: undefined,
          }}
        >
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
            <Select placeholder="Chọn loại khiếu nại" disabled={role === "seller"}>
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
            <Input placeholder="Nhập tiêu đề khiếu nại" disabled={role === "seller"} />
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
              disabled={role === "seller"}
            />
          </Form.Item>

          <Form.Item
            label="Ảnh minh chứng"
            name="evidenceImages"
            extra="Tải lên ảnh minh chứng cho khiếu nại của bạn (JPG/PNG, tối đa 5MB/ảnh)"
          >
            <Upload {...uploadProps} disabled={role === "seller"}>
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
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                disabled={role === "seller"}
              >
                {role === "seller" ? "Tính năng đang phát triển" : "Gửi khiếu nại"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {previewVisible && (
        <Modal
          open={previewVisible}
          footer={null}
          onCancel={() => setPreviewVisible(false)}
        >
          <img alt="preview" style={{ width: "100%" }} src={previewImage} />
        </Modal>
      )}
    </>
  );
};

export default ComplaintSubmissionForm;

