import { useState, useEffect } from "react";
import { Button, Table, Tag, Space, Input, Modal, message, Form } from "antd";
import {
  ExclamationCircleOutlined,
  ReloadOutlined,
  SearchOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { Eye } from "lucide-react";
import apiClient from "../../services/apiClient";

const { TextArea } = Input;

const KYCTab = () => {
  const [activeSubTab, setActiveSubTab] = useState("pending"); // tab trang thái đang chọn
  const [kycData, setKycData] = useState([]);
  // Lưu các KYC đã duyệt/từ chối để hiển thị ở các tab tương ứng
  const [approvedKyc, setApprovedKyc] = useState([]);
  const [rejectedKyc, setRejectedKyc] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState(""); // từ khóa tìm kiếm
  const [selectedKyc, setSelectedKyc] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRejectKyc, setSelectedRejectKyc] = useState(null);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [form] = Form.useForm();

  // Fetch KYC data for admin (all statuses)
  const fetchKycData = async () => {
    setLoading(true);
    try {
      // Gọi API admin để lấy dữ liệu KYC (chỉ trả về STAFF_APPROVED)
      const response = await apiClient.get("/kyc/admin");
      console.log("Admin API response:", response.data);

      // Lưu vào state cho pending tab
      setKycData(response.data.data || []);
      
      // Giữ lại các KYC đã duyệt/từ chối trong local state (không bị mất khi refresh)
      // Chỉ reset nếu user click "Làm mới"
    } catch (error) {
      console.error("Error fetching KYC data:", error);
      
      // Xử lý lỗi cụ thể
      const status = error?.response?.status;
      if (status === 401) {
        message.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại");
      } else if (status === 403) {
        message.error("Bạn không có quyền truy cập trang này");
      } else if (status >= 500) {
        message.error("Hệ thống đang gặp sự cố. Vui lòng thử lại sau");
      } else {
        message.error("Không thể tải dữ liệu KYC. Vui lòng thử lại");
      }
    } finally {
      setLoading(false);
    }
  };

  // Filter data based on sub-tab for admin
  const getFilteredData = () => {
    let filtered = [];

    // Merge data từ các nguồn khác nhau
    switch (activeSubTab) {
      case "pending":
        // Hiển thị STAFF_APPROVED (chờ admin duyệt) từ API
        filtered = kycData.filter((item) => {
          const status = item.status?.toUpperCase();
          return status === "STAFF_APPROVED" || status === "STAFF_APPROVE";
        });
        break;
      case "approved":
        // Hiển thị ADMIN_APPROVED từ local state (đã duyệt)
        filtered = approvedKyc;
        break;
      case "rejected":
        // Hiển thị REJECTED từ local state (đã từ chối)
        filtered = rejectedKyc;
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

  // Get counts for each tab
  const getCount = (tabKey) => {
    switch (tabKey) {
      case "pending":
        return kycData.filter((item) => {
          const status = item.status?.toUpperCase();
          return status === "STAFF_APPROVED" || status === "STAFF_APPROVE";
        }).length;
      case "approved":
        return approvedKyc.length;
      case "rejected":
        return rejectedKyc.length;
      default:
        return 0;
    }
  };

  // Approve KYC
  const handleApprove = async (kycId) => {
    try {
      const response = await apiClient.post(`/kyc/${kycId}/admin/approve`);
      if (response.data.code === 1000) {
        message.success("Duyệt KYC thành công");
        
        // Tìm KYC vừa duyệt và chuyển sang approved list
        const approvedItem = kycData.find(item => item.id === kycId);
        if (approvedItem) {
          // Update status từ response hoặc set mặc định
          const updatedItem = {
            ...approvedItem,
            status: response.data.data?.status || "ADMIN_APPROVED",
            ...response.data.data // Merge data từ server response
          };
          
          // Thêm vào approved list và xóa khỏi pending list
          setApprovedKyc(prev => {
            // Kiểm tra xem đã có chưa để tránh duplicate
            if (prev.find(item => item.id === kycId)) {
              return prev.map(item => item.id === kycId ? updatedItem : item);
            }
            return [updatedItem, ...prev];
          });
          setKycData(prev => prev.filter(item => item.id !== kycId));
        }
        
        fetchKycData(); // Refresh data để cập nhật pending list
      } else {
        message.error("Lỗi khi duyệt KYC");
      }
    } catch (error) {
      console.error("Error approving KYC:", error);
      message.error("Lỗi kết nối server");
    }
  };

  // Show reject modal
  const showRejectForm = (kyc) => {
    setSelectedRejectKyc(kyc);
    form.resetFields();
    setShowRejectModal(true);
  };

  // Handle reject KYC với lý do từ form
  const handleReject = async () => {
    try {
      await form.validateFields();
      const reason = form.getFieldValue("reason");
      
      if (!reason || reason.trim() === "") {
        message.error("Vui lòng nhập lý do từ chối");
        return;
      }

      const kycId = selectedRejectKyc?.id;
      if (!kycId) {
        message.error("Không tìm thấy KYC để từ chối");
        return;
      }

      setLoading(true);
      const response = await apiClient.post(`/kyc/${kycId}/reject`, {
        reason: reason.trim(),
      });
      
      if (response.data.code === 1000) {
        message.success("Từ chối KYC thành công");
        
        // Tìm KYC vừa từ chối và chuyển sang rejected list
        const rejectedItem = kycData.find(item => item.id === kycId);
        if (rejectedItem) {
          // Update status từ response
          const updatedItem = {
            ...rejectedItem,
            status: response.data.data?.status || "REJECTED",
            rejectionReason: reason.trim(),
            ...response.data.data // Merge data từ server response
          };
          
          // Thêm vào rejected list và xóa khỏi pending list
          setRejectedKyc(prev => {
            // Kiểm tra xem đã có chưa để tránh duplicate
            if (prev.find(item => item.id === kycId)) {
              return prev.map(item => item.id === kycId ? updatedItem : item);
            }
            return [updatedItem, ...prev];
          });
          setKycData(prev => prev.filter(item => item.id !== kycId));
        }
        
        // Đóng modal và reset form
        setShowRejectModal(false);
        form.resetFields();
        setSelectedRejectKyc(null);
        
        fetchKycData(); // Refresh data để cập nhật pending list
      } else {
        message.error("Lỗi khi từ chối KYC");
      }
    } catch (error) {
      if (error?.errorFields) {
        // Validation error từ form
        return;
      }
      console.error("Error rejecting KYC:", error);
      message.error("Lỗi kết nối server");
    } finally {
      setLoading(false);
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
    const statusUpper = status?.toUpperCase();
    const statusMap = {
      PENDING: { color: "warning", text: "Chờ Staff duyệt" },
      STAFF_APPROVED: { color: "processing", text: "Chờ Admin duyệt" },
      STAFF_APPROVE: { color: "processing", text: "Chờ Admin duyệt" },
      ADMIN_APPROVED: { color: "success", text: "Đã duyệt" },
      ADMIN_APPROVE: { color: "success", text: "Đã duyệt" },
      REJECTED: { color: "error", text: "Đã từ chối" },
      REJECT: { color: "error", text: "Đã từ chối" },
    };
    return statusMap[statusUpper] || { color: "default", text: status };
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
      render: (date) => (date ? new Date(date).toLocaleDateString("vi-VN") : "N/A"),
    },
    // Hiển thị cột lý do từ chối khi ở tab "Đã từ chối"
    ...(activeSubTab === "rejected" ? [{
      title: "Lý do từ chối",
      dataIndex: "rejectionReason",
      key: "rejectionReason",
      width: 100,
      render: (reason, record) => {
        if (!reason) {
          return <span style={{ color: "#999", fontStyle: "italic" }}>Không có</span>;
        }
        return (
          <button
            onClick={() => {
              setSelectedReason(reason);
              setShowReasonModal(true);
            }}
            style={{
              background: "rgba(255, 193, 7, 0.2)",
              border: "1px solid rgba(255, 193, 7, 0.4)",
              borderRadius: "6px",
              padding: "0.5rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffc107",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 193, 7, 0.3)";
              e.currentTarget.style.borderColor = "rgba(255, 193, 7, 0.6)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 193, 7, 0.2)";
              e.currentTarget.style.borderColor = "rgba(255, 193, 7, 0.4)";
            }}
            title="Click để xem lý do từ chối"
          >
            <Eye size={16} />
          </button>
        );
      },
    }] : []),
    {
      title: "Thao tác",
      key: "actions",
      width: 250,
      render: (_, record) => {
        const status = record.status?.toUpperCase();
        const isPending = status === "STAFF_APPROVED" || status === "STAFF_APPROVE";
        
        return (
          <Space>
            <Button
              type="primary"
              size="small"
              onClick={() => showDetail(record)}
            >
              Chi tiết
            </Button>
            {isPending && (
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
                  onClick={() => showRejectForm(record)}
                >
                  Từ chối
                </Button>
              </>
            )}
          </Space>
        );
      },
    },
  ];

  // Helper functions để lưu/load với key riêng (không bị ảnh hưởng khi logout)
  const STORAGE_KEY_APPROVED = "admin_kyc_approved_data";
  const STORAGE_KEY_REJECTED = "admin_kyc_rejected_data";

  const saveApprovedToStorage = (data) => {
    try {
      const dataWithTimestamp = {
        data: data,
        timestamp: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY_APPROVED, JSON.stringify(dataWithTimestamp));
    } catch (error) {
      console.error("Error saving approved KYC to storage:", error);
    }
  };

  const saveRejectedToStorage = (data) => {
    try {
      const dataWithTimestamp = {
        data: data,
        timestamp: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY_REJECTED, JSON.stringify(dataWithTimestamp));
    } catch (error) {
      console.error("Error saving rejected KYC to storage:", error);
    }
  };

  const loadApprovedFromStorage = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_APPROVED);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Kiểm tra timestamp - nếu quá 30 ngày thì xóa (data cũ quá)
        const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
        if (parsed.timestamp && Date.now() - parsed.timestamp > THIRTY_DAYS) {
          localStorage.removeItem(STORAGE_KEY_APPROVED);
          return [];
        }
        return parsed.data || [];
      }
    } catch (error) {
      console.error("Error loading approved KYC from storage:", error);
      // Nếu parse lỗi, xóa data corrupt
      localStorage.removeItem(STORAGE_KEY_APPROVED);
    }
    return [];
  };

  const loadRejectedFromStorage = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_REJECTED);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Kiểm tra timestamp - nếu quá 30 ngày thì xóa (data cũ quá)
        const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
        if (parsed.timestamp && Date.now() - parsed.timestamp > THIRTY_DAYS) {
          localStorage.removeItem(STORAGE_KEY_REJECTED);
          return [];
        }
        return parsed.data || [];
      }
    } catch (error) {
      console.error("Error loading rejected KYC from storage:", error);
      // Nếu parse lỗi, xóa data corrupt
      localStorage.removeItem(STORAGE_KEY_REJECTED);
    }
    return [];
  };

  // Load approved/rejected KYC from localStorage on mount
  useEffect(() => {
    // Load data từ storage với key riêng
    const savedApproved = loadApprovedFromStorage();
    const savedRejected = loadRejectedFromStorage();
    
    if (savedApproved.length > 0) {
      setApprovedKyc(savedApproved);
      console.log(`✅ Loaded ${savedApproved.length} approved KYC from storage`);
    }
    
    if (savedRejected.length > 0) {
      setRejectedKyc(savedRejected);
      console.log(`✅ Loaded ${savedRejected.length} rejected KYC from storage`);
    }
    
    fetchKycData();
  }, []);

  // Save to localStorage whenever approved/rejected lists change
  useEffect(() => {
    if (approvedKyc.length > 0) {
      saveApprovedToStorage(approvedKyc);
    }
  }, [approvedKyc]);

  useEffect(() => {
    if (rejectedKyc.length > 0) {
      saveRejectedToStorage(rejectedKyc);
    }
  }, [rejectedKyc]);

  const filteredData = getFilteredData();

  // Get title based on active tab
  const getTabTitle = () => {
    switch (activeSubTab) {
      case "pending":
        return `Danh sách KYC chờ Admin duyệt (${getCount("pending")})`;
      case "approved":
        return `Danh sách KYC đã duyệt (${getCount("approved")})`;
      case "rejected":
        return `Danh sách KYC đã từ chối (${getCount("rejected")})`;
      default:
        return "Quản lý KYC";
    }
  };

  return (
    <div
      style={{
        backgroundColor: "rgba(26, 26, 46, 0.8)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "15px",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
        padding: "2rem",
        color: "white",
      }}
    >
      {/* Header with Tabs */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <h3 style={{ margin: 0 }}>{getTabTitle()}</h3>
        <button
          className="btn btn-primary"
          onClick={fetchKycData}
          disabled={loading}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <ReloadOutlined />
          Làm mới
        </button>
      </div>

      {/* Tabs Navigation */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          marginBottom: "1.5rem",
          borderBottom: "2px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <button
          onClick={() => setActiveSubTab("pending")}
          style={{
            padding: "0.75rem 1.5rem",
            background: "none",
            border: "none",
            borderBottom: activeSubTab === "pending" ? "3px solid #667eea" : "3px solid transparent",
            color: activeSubTab === "pending" ? "white" : "rgba(255, 255, 255, 0.7)",
            fontWeight: activeSubTab === "pending" ? "600" : "400",
            cursor: "pointer",
            fontSize: "1rem",
            transition: "all 0.3s",
          }}
        >
          Chờ Admin duyệt ({getCount("pending")})
        </button>
        <button
          onClick={() => setActiveSubTab("approved")}
          style={{
            padding: "0.75rem 1.5rem",
            background: "none",
            border: "none",
            borderBottom: activeSubTab === "approved" ? "3px solid #667eea" : "3px solid transparent",
            color: activeSubTab === "approved" ? "white" : "rgba(255, 255, 255, 0.7)",
            fontWeight: activeSubTab === "approved" ? "600" : "400",
            cursor: "pointer",
            fontSize: "1rem",
            transition: "all 0.3s",
          }}
        >
          Đã duyệt ({getCount("approved")})
        </button>
        <button
          onClick={() => setActiveSubTab("rejected")}
          style={{
            padding: "0.75rem 1.5rem",
            background: "none",
            border: "none",
            borderBottom: activeSubTab === "rejected" ? "3px solid #667eea" : "3px solid transparent",
            color: activeSubTab === "rejected" ? "white" : "rgba(255, 255, 255, 0.7)",
            fontWeight: activeSubTab === "rejected" ? "600" : "400",
            cursor: "pointer",
            fontSize: "1rem",
            transition: "all 0.3s",
          }}
        >
          Đã từ chối ({getCount("rejected")})
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: "1rem" }}>
        <Input
          placeholder="Tìm kiếm theo ID, User ID, trạng thái..."
          prefix={<SearchOutlined />}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            maxWidth: "400px",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            borderColor: "rgba(255, 255, 255, 0.2)",
            color: "white",
          }}
        />
      </div>

<<<<<<< hao
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
=======
      {/* Table with Dark Theme */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", color: "white" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid rgba(255, 255, 255, 0.1)" }}>
              <th style={{ padding: "1rem", textAlign: "left", color: "white" }}>ID</th>
              <th style={{ padding: "1rem", textAlign: "left", color: "white" }}>User ID</th>
              <th style={{ padding: "1rem", textAlign: "left", color: "white" }}>Trạng thái</th>
              <th style={{ padding: "1rem", textAlign: "left", color: "white" }}>Ngày gửi</th>
              {activeSubTab === "rejected" && (
                <th style={{ padding: "1rem", textAlign: "left", color: "white" }}>Lý do từ chối</th>
              )}
              <th style={{ padding: "1rem", textAlign: "left", color: "white" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={activeSubTab === "rejected" ? 6 : 5}
                  style={{ padding: "2rem", textAlign: "center", color: "white" }}
                >
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td
                  colSpan={activeSubTab === "rejected" ? 6 : 5}
                  style={{ padding: "2rem", textAlign: "center", color: "rgba(255, 255, 255, 0.7)" }}
                >
                  Không có dữ liệu KYC
                </td>
              </tr>
            ) : (
              filteredData.map((record) => {
                const status = record.status?.toUpperCase();
                const isPending = status === "STAFF_APPROVED" || status === "STAFF_APPROVE";
                const tag = getStatusTag(record.status);
                
                return (
                  <tr
                    key={record.id}
                    style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}
                  >
                    <td style={{ padding: "1rem", color: "white" }}>#{record.id}</td>
                    <td style={{ padding: "1rem", color: "white" }}>{record.userId}</td>
                    <td style={{ padding: "1rem" }}>
                      <span
                        style={{
                          padding: "0.25rem 0.75rem",
                          borderRadius: "15px",
                          fontSize: "0.8rem",
                          backgroundColor: tag.color === "processing" ? "#17a2b8" + "20" :
                                          tag.color === "success" ? "#28a745" + "20" :
                                          tag.color === "error" ? "#dc3545" + "20" :
                                          "#6c757d" + "20",
                          color: tag.color === "processing" ? "#17a2b8" :
                                tag.color === "success" ? "#28a745" :
                                tag.color === "error" ? "#dc3545" :
                                "#6c757d",
                        }}
                      >
                        {tag.text}
                      </span>
                    </td>
                    <td style={{ padding: "1rem", color: "white" }}>
                      {record.createdAt ? new Date(record.createdAt).toLocaleDateString("vi-VN") : "N/A"}
                    </td>
                    {activeSubTab === "rejected" && (
                      <td style={{ padding: "1rem" }}>
                        {record.rejectionReason ? (
                          <button
                            onClick={() => {
                              setSelectedReason(record.rejectionReason);
                              setShowReasonModal(true);
                            }}
                            style={{
                              background: "rgba(255, 193, 7, 0.2)",
                              border: "1px solid rgba(255, 193, 7, 0.4)",
                              borderRadius: "6px",
                              padding: "0.5rem",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#ffc107",
                              transition: "all 0.2s",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "rgba(255, 193, 7, 0.3)";
                              e.currentTarget.style.borderColor = "rgba(255, 193, 7, 0.6)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "rgba(255, 193, 7, 0.2)";
                              e.currentTarget.style.borderColor = "rgba(255, 193, 7, 0.4)";
                            }}
                            title="Click để xem lý do từ chối"
                          >
                            <Eye size={16} />
                          </button>
                        ) : (
                          <span style={{ color: "rgba(255, 255, 255, 0.5)", fontStyle: "italic" }}>
                            Không có
                          </span>
                        )}
                      </td>
                    )}
                    <td style={{ padding: "1rem" }}>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          className="btn btn-primary"
                          style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}
                          onClick={() => showDetail(record)}
                        >
                          Chi tiết
                        </button>
                        {isPending && (
                          <>
                            <button
                              className="btn btn-success"
                              style={{ padding: "0.5rem" }}
                              onClick={() => {
                                Modal.confirm({
                                  title: "Xác nhận duyệt KYC?",
                                  icon: <ExclamationCircleOutlined />,
                                  onOk: () => handleApprove(record.id),
                                });
                              }}
                              title="Duyệt KYC"
                            >
                              ✓
                            </button>
                            <button
                              className="btn btn-danger"
                              style={{ padding: "0.5rem" }}
                              onClick={() => showRejectForm(record)}
                              title="Từ chối KYC"
                            >
                              ✕
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredData.length > 10 && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "1rem",
            paddingTop: "1rem",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            color: "white",
          }}
        >
          <span>Tổng {filteredData.length} bản ghi</span>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              className="btn btn-secondary"
              style={{ padding: "0.5rem 1rem" }}
            >
              Trước
            </button>
            <button
              className="btn btn-secondary"
              style={{ padding: "0.5rem 1rem" }}
            >
              Sau
            </button>
          </div>
        </div>
      )}
>>>>>>> master

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
              {selectedKyc.createdAt
                ? new Date(selectedKyc.createdAt).toLocaleString("vi-VN")
                : "N/A"}
            </p>

            {userInfo && (
              <>
                <h3 style={{ marginTop: "1rem" }}>Thông tin người dùng</h3>
                <p>
                  <strong>Tên:</strong> {userInfo.fullname || "N/A"}
                </p>
                <p>
                  <strong>Email:</strong> {userInfo.email || "N/A"}
                </p>
                <p>
                  <strong>Số điện thoại:</strong> {userInfo.phone || "N/A"}
                </p>
                <p>
                  <strong>Ngày sinh:</strong> {userInfo.yob || "N/A"}
                </p>
                <p>
                  <strong>Địa chỉ:</strong> {userInfo.address || "N/A"}
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
                      border: "1px solid #ddd",
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
                      border: "1px solid #ddd",
                    }}
                  />
                </div>
              )}
              {!selectedKyc.frontImageUrl && !selectedKyc.backImageUrl && (
                <p style={{ color: "#999" }}>Không có ảnh CMND</p>
              )}
            </div>
            
            {/* Hiển thị lý do từ chối nếu có */}
            {selectedKyc.rejectionReason && (
              <>
                <h3 style={{ marginTop: "1rem" }}>Lý do từ chối</h3>
                <p style={{ 
                  padding: "0.75rem", 
                  backgroundColor: "#fff3cd", 
                  borderRadius: "4px",
                  border: "1px solid #ffc107",
                  color: "#856404"
                }}>
                  {selectedKyc.rejectionReason}
                </p>
              </>
            )}
          </div>
        )}
      </Modal>

      {/* Reject Modal với Form nhập lý do */}
      <Modal
        title="Từ chối KYC"
        open={showRejectModal}
        onOk={handleReject}
        onCancel={() => {
          setShowRejectModal(false);
          form.resetFields();
          setSelectedRejectKyc(null);
        }}
        okText="Xác nhận từ chối"
        cancelText="Hủy"
        okButtonProps={{ danger: true, loading: loading }}
        width={600}
      >
        {selectedRejectKyc && (
          <div>
            <p style={{ marginBottom: "1rem" }}>
              <strong>Bạn đang từ chối KYC:</strong> #{selectedRejectKyc.id} (User ID: {selectedRejectKyc.userId})
            </p>
            
            <Form
              form={form}
              layout="vertical"
              onFinish={handleReject}
            >
              <Form.Item
                label="Lý do từ chối"
                name="reason"
                rules={[
                  { required: true, message: "Vui lòng nhập lý do từ chối" },
                  { min: 5, message: "Lý do từ chối phải có ít nhất 5 ký tự" },
                  { max: 500, message: "Lý do từ chối không được vượt quá 500 ký tự" }
                ]}
              >
                <TextArea
                  rows={5}
                  placeholder="Nhập lý do từ chối KYC (ví dụ: Thông tin không hợp lệ, hình ảnh bị mờ, giấy tờ không rõ ràng...)"
                  showCount
                  maxLength={500}
                />
              </Form.Item>
              
              <div style={{ 
                marginTop: "1rem", 
                padding: "0.75rem", 
                backgroundColor: "#f8f9fa", 
                borderRadius: "4px",
                fontSize: "0.875rem",
                color: "#6c757d"
              }}>
                <strong>Lưu ý:</strong> Lý do từ chối sẽ được lưu vào hệ thống và hiển thị cho người dùng.
              </div>
            </Form>
          </div>
        )}
      </Modal>

      {/* Modal hiển thị lý do từ chối */}
      <Modal
        title="Lý do từ chối KYC"
        open={showReasonModal}
        onCancel={() => {
          setShowReasonModal(false);
          setSelectedReason("");
        }}
        footer={[
          <Button key="close" onClick={() => {
            setShowReasonModal(false);
            setSelectedReason("");
          }}>
            Đóng
          </Button>
        ]}
        width={600}
      >
        <div>
          <div
            style={{
              padding: "1rem",
              backgroundColor: "#fff3cd",
              borderRadius: "8px",
              border: "1px solid #ffc107",
              color: "#856404",
              fontSize: "1rem",
              lineHeight: "1.6",
              whiteSpace: "pre-wrap",
              wordWrap: "break-word",
            }}
          >
            {selectedReason || "Không có lý do từ chối"}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default KYCTab;