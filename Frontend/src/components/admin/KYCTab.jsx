import { useState, useEffect } from "react";
import { Filter, Download, CheckCircle, XCircle, Eye } from "lucide-react";
import { Button, Table, Tag, Space, Input, Modal, message, Tabs } from "antd";
import {
  ExclamationCircleOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import apiClient from "../../services/apiClient";

const KYCTab = () => {
  const [activeSubTab, setActiveSubTab] = useState("pending"); // tab trang thái đang chọn
  const [kycData, setKycData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState(""); // từ khóa tìm kiếm
  const [selectedKyc, setSelectedKyc] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Fetch KYC data for admin (all statuses)
  const fetchKycData = async () => {
    setLoading(true);
    try {
      // Test API trước
      // const testResponse = await apiClient.get("/kyc/test");
      // console.log("Test API response:", testResponse.data);

      // Sau đó gọi API admin
      const response = await apiClient.get("/kyc/admin");
      console.log("Admin API response:", response.data);

      setKycData(response.data.data || []);
    } catch (error) {
      console.error("Error fetching KYC data:", error);
      message.error("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  // Filter data based on sub-tab for admin
  const getFilteredData = () => {
    let filtered = kycData;

    // Admin có thể xem tất cả KYC (STAFF_APPROVED, ADMIN_APPROVED, REJECTED)
    switch (activeSubTab) {
      case "pending":
        // Hiển thị STAFF_APPROVED (chờ admin duyệt)
        filtered = kycData.filter((item) => item.status === "STAFF_APPROVED");
        break;
      case "approved":
        // Hiển thị ADMIN_APPROVED (đã duyệt)
        filtered = kycData.filter((item) => item.status === "ADMIN_APPROVED");
        break;
      case "rejected":
        // Hiển thị REJECTED (đã từ chối)
        filtered = kycData.filter((item) => item.status === "REJECTED");
        break;
      default:
        filtered = kycData;
    }

    // Apply search filter
    if (query) {
      filtered = filtered.filter(
        (item) =>
          item.id?.toString().includes(query) ||
          item.userId?.toString().includes(query) ||
          item.status?.toLowerCase().includes(query.toLowerCase())
      );
    }

    return filtered;
  };

  // Approve KYC
  const handleApprove = async (kycId) => {
    try {
      const response = await apiClient.post(`/kyc/${kycId}/admin/approve`);
      if (response.data.code === 1000) {
        message.success("Duyệt KYC thành công");
        fetchKycData(); // Refresh data
      } else {
        message.error("Lỗi khi duyệt KYC");
      }
    } catch (error) {
      console.error("Error approving KYC:", error);
      message.error("Lỗi kết nối server");
    }
  };

  // Reject KYC
  const handleReject = async (kycId, reason) => {
    try {
      const response = await apiClient.post(`/kyc/${kycId}/reject`, {
        reason: reason,
      });
      if (response.data.code === 1000) {
        message.success("Từ chối KYC thành công");
        fetchKycData(); // Refresh data
      } else {
        message.error("Lỗi khi từ chối KYC");
      }
    } catch (error) {
      console.error("Error rejecting KYC:", error);
      message.error("Lỗi kết nối server");
    }
  };

  // Get user info for KYC
  const getUserInfo = async (kycId) => {
    try {
      const response = await apiClient.get(`/kyc/${kycId}/infor/user`);
      if (response.data.code === 1000) {
        return response.data.data;
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
    return null;
  };

  // Show detail modal
  const showDetail = async (kyc) => {
    const user = await getUserInfo(kyc.id);
    setSelectedKyc(kyc);
    setUserInfo(user);
    setShowDetailModal(true);
  };

  // Status tag component
  const getStatusTag = (status) => {
    const statusMap = {
      PENDING: { color: "warning", text: "Chờ Staff duyệt" },
      STAFF_APPROVED: { color: "processing", text: "Chờ Admin duyệt" },
      ADMIN_APPROVED: { color: "success", text: "Đã duyệt" },
      REJECTED: { color: "error", text: "Đã từ chối" },
    };
    return statusMap[status] || { color: "default", text: status };
  };

  // Table columns
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      render: (id) => `#${id}`,
    },
    {
      title: "User ID",
      dataIndex: "userId",
      key: "userId",
      width: 100,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const tag = getStatusTag(status);
        return <Tag color={tag.color}>{tag.text}</Tag>;
      },
    },
    {
      title: "Ngày gửi",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            onClick={() => showDetail(record)}
          >
            Chi tiết
          </Button>
          {record.status === "STAFF_APPROVED" && (
            <>
              <Button
                type="primary"
                size="small"
                onClick={() => {
                  Modal.confirm({
                    title: "Xác nhận duyệt KYC?",
                    icon: <ExclamationCircleOutlined />,
                    onOk: () => handleApprove(record.id),
                  });
                }}
              >
                Duyệt
              </Button>
              <Button
                danger
                size="small"
                onClick={() => {
                  Modal.confirm({
                    title: "Xác nhận từ chối KYC?",
                    icon: <ExclamationCircleOutlined />,
                    content: "Bạn có chắc chắn muốn từ chối KYC này?",
                    onOk: () => handleReject(record.id, "Admin từ chối"),
                  });
                }}
              >
                Từ chối
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  // Sub-tab items for admin
  const subTabItems = [
    {
      key: "pending",
      label: "Chờ Admin duyệt",
      children: null, // Will be handled by getFilteredData
    },
    {
      key: "approved",
      label: "Đã duyệt",
      children: null,
    },
    {
      key: "rejected",
      label: "Đã từ chối",
      children: null,
    },
  ];

  useEffect(() => {
    fetchKycData();
  }, []);

  const filteredData = getFilteredData();

  return (
    <div style={{ padding: "1rem", color: "white" }}>
      {/* Header */}
      <div style={{ marginBottom: "1rem" }}>
        <h2 style={{ color: "white", marginBottom: "0.5rem" }}>
          Quản lý KYC - Admin
        </h2>
        <p style={{ color: "rgba(255, 255, 255, 0.7)" }}>
          Duyệt các yêu cầu KYC đã được Staff phê duyệt
        </p>
      </div>

      {/* Search and Refresh */}
      <div
        style={{
          marginBottom: "1rem",
          display: "flex",
          gap: "1rem",
          alignItems: "center",
        }}
      >
        <Button
          icon={<ReloadOutlined />}
          onClick={fetchKycData}
          loading={loading}
        >
          Tải lại
        </Button>
        <Input
          placeholder="Tìm kiếm theo ID, User ID, trạng thái..."
          prefix={<SearchOutlined />}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ width: 300 }}
        />
      </div>

      {/* Sub-tabs */}
      <Tabs
        activeKey={activeSubTab}
        onChange={setActiveSubTab}
        items={subTabItems}
        style={{ marginBottom: "1rem" }}
      />
      {/* hiển thị bảng */}
      {/* Table */}
      <Table
        columns={columns}
        dataSource={filteredData}
        loading={loading}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `Tổng ${total} bản ghi`,
        }}
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          borderRadius: "8px",
        }}
      />

      {/* Detail Modal */}
      <Modal
        title="Chi tiết KYC"
        open={showDetailModal}
        onCancel={() => setShowDetailModal(false)}
        footer={null}
        width={800}
      >
        {selectedKyc && (
          <div>
            <h3>Thông tin KYC</h3>
            <p>
              <strong>ID:</strong> #{selectedKyc.id}
            </p>
            <p>
              <strong>Trạng thái:</strong>{" "}
              {getStatusTag(selectedKyc.status).text}
            </p>
            <p>
              <strong>Ngày gửi:</strong>{" "}
              {new Date(selectedKyc.createdAt).toLocaleString("vi-VN")}
            </p>

            {userInfo && (
              <>
                <h3 style={{ marginTop: "1rem" }}>Thông tin người dùng</h3>
                <p>
                  <strong>Tên:</strong> {userInfo.fullname}
                </p>
                <p>
                  <strong>Email:</strong> {userInfo.email}
                </p>
                <p>
                  <strong>Số điện thoại:</strong> {userInfo.phone}
                </p>
                <p>
                  <strong>Ngày sinh:</strong> {userInfo.yob}
                </p>
                <p>
                  <strong>Địa chỉ:</strong> {userInfo.address}
                </p>
              </>
            )}

            <h3 style={{ marginTop: "1rem" }}>Ảnh CMND</h3>
            <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
              {selectedKyc.frontImageUrl && (
                <div>
                  <p>Mặt trước:</p>
                  <img
                    src={selectedKyc.frontImageUrl}
                    alt="Mặt trước CMND"
                    style={{
                      width: 200,
                      height: 120,
                      objectFit: "cover",
                      borderRadius: "4px",
                    }}
                  />
                </div>
              )}
              {selectedKyc.backImageUrl && (
                <div>
                  <p>Mặt sau:</p>
                  <img
                    src={selectedKyc.backImageUrl}
                    alt="Mặt sau CMND"
                    style={{
                      width: 200,
                      height: 120,
                      objectFit: "cover",
                      borderRadius: "4px",
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default KYCTab;
