// src/components/complaints/ComplaintForm.jsx
import React, { useState, useEffect } from "react";
import { Modal, Button, message, Spin, Tabs, Card, Tag, Empty } from "antd";
import { ShoppingCartOutlined, ShopOutlined } from "@ant-design/icons";
import contractService from "../../services/contractService";
import ComplaintSubmissionForm from "./ComplaintSubmissionForm";

const { TabPane } = Tabs;

const ComplaintForm = ({
  visible,
  onClose,
  onSuccess,
  userId,
  complaints,
  userEmail,
  userName,
}) => {
  const [contracts, setContracts] = useState([]);
  const [loadingContracts, setLoadingContracts] = useState(false);
  const [activeTab, setActiveTab] = useState("bought");
  const [showComplaintSubmission, setShowComplaintSubmission] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [contractRole, setContractRole] = useState(null); // 'buyer' or 'seller'

  // Load contracts
  useEffect(() => {
    if (visible && userId) {
      loadContracts();
    } else {
      setContracts([]);
    }
  }, [visible, userId]);

  const loadContracts = async () => {
    setLoadingContracts(true);
    try {
      const result = await contractService.getContractsByUser(userId);
      if (result.success && result.data) {
        // todo

        var data = Array.isArray(result.data) ? result.data : [];

        // Lấy list productId, loại bỏ null/undefined
        const complaintIdSet = new Set(
          complaints.map((x) => x?.productId).filter(Boolean)
        );

        // Giữ lại những id KHÔNG có trong complaints
        data = data.filter((x) => !complaintIdSet.has(x?.productId));
        setContracts(data);
      } else {
        message.warning("Không thể tải danh sách hợp đồng");
        setContracts([]);
      }
    } catch (error) {
      console.error("Error loading contracts:", error);
      message.error("Lỗi khi tải danh sách hợp đồng");
      setContracts([]);
    } finally {
      setLoadingContracts(false);
    }
  };

  // Filter contracts based on user role
  const getFilteredContracts = () => {
    if (!userId || !contracts.length) return [];
    const userIdNum = Number(userId);

    if (activeTab === "bought") {
      // Contracts where user is buyer
      return contracts.filter(
        (contract) => Number(contract.buyerId) === userIdNum
      );
    } else {
      // Contracts where user is seller
      return contracts.filter(
        (contract) => Number(contract.sellerId) === userIdNum
      );
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return "0 VNĐ";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      PENDING: { color: "orange", text: "Chờ ký" },
      SIGNED: { color: "blue", text: "Đã ký" },
      CANCELLED: { color: "red", text: "Đã hủy" },
      COMPLETED: { color: "green", text: "Hoàn thành" },
    };
    const config = statusConfig[status] || { color: "default", text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // Hiển thị status badges theo độ ưu tiên: deliveryCompleted > paymentCompleted > sellerSigned > buyerSigned
  const getContractStatusBadges = (contract) => {
    const badges = [];

    // Ưu tiên 1: deliveryCompleted
    if (contract.deliveryCompleted) {
      badges.push(
        <Tag key="delivery" color="success">
          <i className="bi bi-truck me-1"></i>
          Đã giao hàng
        </Tag>
      );
    } else {
      badges.push(
        <Tag key="delivery" color="default">
          <i className="bi bi-hourglass-split me-1"></i>
          Chưa giao hàng
        </Tag>
      );
    }

    // Ưu tiên 2: paymentCompleted
    if (contract.paymentCompleted) {
      badges.push(
        <Tag key="payment" color="success">
          <i className="bi bi-check-circle me-1"></i>
          Đã thanh toán
        </Tag>
      );
    } else {
      badges.push(
        <Tag key="payment" color="warning">
          <i className="bi bi-clock me-1"></i>
          Chưa thanh toán
        </Tag>
      );
    }

    // Ưu tiên 3: sellerSigned
    if (contract.sellerSigned) {
      badges.push(
        <Tag key="seller-signed" color="blue">
          <i className="bi bi-person-check me-1"></i>
          Người bán đã ký
        </Tag>
      );
    } else {
      badges.push(
        <Tag key="seller-signed" color="default">
          <i className="bi bi-person-x me-1"></i>
          Người bán chưa ký
        </Tag>
      );
    }

    // Ưu tiên 4: buyerSigned
    if (contract.buyerSigned) {
      badges.push(
        <Tag key="buyer-signed" color="blue">
          <i className="bi bi-person-check me-1"></i>
          Người mua đã ký
        </Tag>
      );
    } else {
      badges.push(
        <Tag key="buyer-signed" color="default">
          <i className="bi bi-person-x me-1"></i>
          Người mua chưa ký
        </Tag>
      );
    }

    return badges;
  };

  const handleComplaintClick = (contract) => {
    const userIdNum = Number(userId);
    const isBuyer = Number(contract.buyerId) === userIdNum;

    // Chỉ cho phép mở form khiếu nại nếu là buyer
    if (!isBuyer) {
      message.warning(
        "Tính năng khiếu nại cho người bán đang được phát triển. Vui lòng thử lại sau!"
      );
      return;
    }

    setSelectedContract(contract);
    setContractRole("buyer");
    setShowComplaintSubmission(true);
  };

  const handleComplaintSubmitSuccess = () => {
    setShowComplaintSubmission(false);
    setSelectedContract(null);
    setContractRole(null);
    onSuccess?.();
    // Optionally close the main modal
    // onClose();
  };

  const filteredContracts = getFilteredContracts();

  return (
    <>
      <Modal
        title={
          <div>
            <h4 style={{ margin: 0 }}>
              <i
                className="bi bi-exclamation-triangle-fill me-2"
                style={{ color: "#ffc107" }}
              ></i>
              Tạo khiếu nại mới
            </h4>
          </div>
        }
        open={visible}
        onCancel={onClose}
        footer={null}
        width={900}
        style={{ top: 20 }}
      >
        {loadingContracts ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Spin size="large" tip="Đang tải danh sách hợp đồng..." />
          </div>
        ) : contracts.length === 0 ? (
          <Empty
            description="Không có hợp đồng nào"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <div>
            <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
              <TabPane
                tab={
                  <span>
                    <ShoppingCartOutlined />
                    Hợp đồng tôi mua (
                    {
                      contracts.filter(
                        (c) => Number(c.buyerId) === Number(userId)
                      ).length
                    }
                    )
                  </span>
                }
                key="bought"
              >
                <ContractList
                  contracts={filteredContracts}
                  userId={userId}
                  role="buyer"
                  onComplaintClick={handleComplaintClick}
                  formatCurrency={formatCurrency}
                  formatDate={formatDate}
                  getStatusTag={getStatusTag}
                  getContractStatusBadges={getContractStatusBadges}
                />
              </TabPane>
              {/* <TabPane
                tab={
                  <span>
                    <ShopOutlined />
                    Hợp đồng tôi bán (
                    {
                      contracts.filter(
                        (c) => Number(c.sellerId) === Number(userId)
                      ).length
                    }
                    )
                  </span>
                }
                key="sold"
              >
                <ContractList
                  contracts={filteredContracts}
                  userId={userId}
                  role="seller"
                  onComplaintClick={handleComplaintClick}
                  formatCurrency={formatCurrency}
                  formatDate={formatDate}
                  getStatusTag={getStatusTag}
                  getContractStatusBadges={getContractStatusBadges}
                />
              </TabPane> */}
            </Tabs>
          </div>
        )}
      </Modal>

      {/* Complaint Submission Form Modal */}
      {showComplaintSubmission && selectedContract && (
        <ComplaintSubmissionForm
          visible={showComplaintSubmission}
          onClose={() => {
            setShowComplaintSubmission(false);
            setSelectedContract(null);
            setContractRole(null);
          }}
          onSuccess={handleComplaintSubmitSuccess}
          contract={selectedContract}
          role={contractRole} // 'buyer' or 'seller'
          userId={userId}
          userEmail={userEmail}
          userName={userName}
        />
      )}
    </>
  );
};

// Contract List Component
const ContractList = ({
  contracts,
  userId,
  role,
  onComplaintClick,
  formatCurrency,
  formatDate,
  getStatusTag,
  getContractStatusBadges,
}) => {
  if (contracts.length === 0) {
    return (
      <Empty
        description={`Bạn chưa có hợp đồng ${
          role === "buyer" ? "mua hàng" : "bán hàng"
        } nào`}
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        style={{ padding: "40px 0" }}
      />
    );
  }

  return (
    <div style={{ maxHeight: "500px", overflowY: "auto" }}>
      {contracts.map((contract) => (
        <Card
          key={contract.id}
          className="mb-3"
          style={{ borderLeft: `4px solid ${getStatusColor(contract.status)}` }}
        >
          <div className="d-flex justify-content-between align-items-start mb-2">
            <div className="flex-grow-1">
              <h6 className="mb-1">
                <strong>{contract.productName}</strong>
              </h6>
              <div className="text-muted small mb-2">
                <strong>Mã hợp đồng:</strong> {contract.contractCode}
              </div>
            </div>
            {getStatusTag(contract.status)}
          </div>

          <div className="row mb-2">
            <div className="col-md-6">
              <div className="mb-1">
                <strong>{role === "buyer" ? "Người bán" : "Người mua"}:</strong>{" "}
                <span className="text-primary">
                  {role === "buyer" ? contract.sellerName : contract.buyerName}
                </span>
              </div>
              <div className="mb-1">
                <strong>Giá thỏa thuận:</strong>{" "}
                <span className="text-success fw-bold">
                  {formatCurrency(contract.agreedPrice)}
                </span>
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-1">
                <small className="text-muted">
                  <strong>Tạo lúc:</strong> {formatDate(contract.createdAt)}
                </small>
              </div>
              {contract.signedAt && (
                <div className="mb-1">
                  <small className="text-muted">
                    <strong>Ký lúc:</strong> {formatDate(contract.signedAt)}
                  </small>
                </div>
              )}
            </div>
          </div>

          {/* Status Badges theo độ ưu tiên */}
          <div className="mb-2 pt-2 border-top">
            <div className="mb-1">
              <strong>
                <i className="bi bi-info-circle me-1"></i>
                Trạng thái hợp đồng:
              </strong>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {getContractStatusBadges(contract)}
            </div>
          </div>

          <div className="border-top pt-2 mt-2">
            {role === "seller" ? (
              <Button
                type="default"
                size="small"
                disabled
                block
                title="Tính năng khiếu nại cho người bán đang được phát triển"
              >
                <i className="bi bi-exclamation-triangle me-2"></i>
                Gửi đơn khiếu nại (Đang phát triển)
              </Button>
            ) : (
              <Button
                type="primary"
                size="small"
                onClick={() => onComplaintClick(contract)}
                block
              >
                <i className="bi bi-exclamation-triangle me-2"></i>
                Gửi đơn khiếu nại
              </Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};

const getStatusColor = (status) => {
  const colors = {
    PENDING: "#ffc107",
    SIGNED: "#0d6efd",
    CANCELLED: "#dc3545",
    COMPLETED: "#198754",
  };
  return colors[status] || "#6c757d";
};

export default ComplaintForm;
