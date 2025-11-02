import React, { useState, useEffect } from "react";
import { Container, Card, Spinner, Alert, Button } from "react-bootstrap";
import complaintService from "../../services/complaintService";
import ComplaintForm from "../../components/complaints/ComplaintForm";

const MyComplaintsPage = ({ user }) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showComplaintForm, setShowComplaintForm] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadComplaints();
    }
  }, [user]);

  const loadComplaints = async () => {
    setLoading(true);
    setError(null);

    const result = await complaintService.getMyComplaints();

    if (result.success) {
      setComplaints(result.data || []);
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      PENDING: { variant: "warning", text: "Chờ xử lý" },
      UNDER_REVIEW: { variant: "info", text: "Đang xem xét" },
      RESOLVED_BUYER_FAVOR: {
        variant: "success",
        text: "Giải quyết cho Buyer",
      },
      RESOLVED_SELLER_FAVOR: {
        variant: "success",
        text: "Giải quyết cho Seller",
      },
      CLOSED: { variant: "secondary", text: "Đã đóng" },
    };

    const config = statusConfig[status] || {
      variant: "secondary",
      text: status,
    };
    return <span className={`badge bg-${config.variant}`}>{config.text}</span>;
  };

  if (!user) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "18px",
          color: "#666",
        }}
      >
        Vui lòng đăng nhập để xem khiếu nại
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8f9fa",
        padding: "20px 0",
      }}
    >
      <Container>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>
            <i
              className="bi bi-exclamation-triangle-fill me-2"
              style={{ color: "#ffc107" }}
            ></i>
            Khiếu nại của tôi
          </h2>
          <Button variant="primary" onClick={() => setShowComplaintForm(true)}>
            <i className="bi bi-plus-circle me-2"></i>
            Tạo khiếu nại mới
          </Button>
        </div>

        {loading ? (
          <Card>
            <Card.Body className="text-center">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Đang tải...</span>
              </Spinner>
            </Card.Body>
          </Card>
        ) : error ? (
          <Card>
            <Card.Body>
              <Alert variant="danger">{error}</Alert>
            </Card.Body>
          </Card>
        ) : (
          <Card>
            <Card.Body>
              {complaints.length === 0 ? (
                <div className="text-center py-4">
                  <i
                    className="bi bi-check-circle-fill text-success"
                    style={{ fontSize: "3rem" }}
                  ></i>
                  <p className="mt-3 text-muted">Bạn chưa có khiếu nại nào</p>
                </div>
              ) : (
                <div>
                  <div className="mb-3">
                    <strong>Tổng số khiếu nại: </strong>
                    <span className="badge bg-primary">
                      {complaints.length}
                    </span>
                  </div>

                  {complaints.map((complaint) => (
                    <Card
                      key={complaint.id}
                      className="mb-3 border-start border-4 border-warning"
                    >
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <h6 className="mb-1">Khiếu nại #{complaint.id}</h6>
                            <small className="text-muted">
                              Về người bán:{" "}
                              <strong>
                                {complaint.sellerName ||
                                  complaint.seller?.fullname ||
                                  "N/A"}
                              </strong>
                            </small>
                          </div>
                          {getStatusBadge(complaint.status)}
                        </div>

                        {complaint.title && (
                          <div className="mb-2">
                            <strong>Tiêu đề:</strong> {complaint.title}
                          </div>
                        )}

                        {complaint.description && (
                          <div className="mb-2">
                            <strong>Nội dung:</strong>
                            <p
                              className="mb-0 mt-1"
                              style={{ whiteSpace: "pre-wrap" }}
                            >
                              {complaint.description}
                            </p>
                          </div>
                        )}

                        {complaint.category && (
                          <div className="mb-2">
                            <strong>Loại khiếu nại:</strong>{" "}
                            {complaint.category === "PRODUCT_QUALITY" &&
                              "Chất lượng sản phẩm"}
                            {complaint.category === "DAMAGED_ITEM" &&
                              "Hàng bị hư hỏng"}
                            {complaint.category === "NOT_AS_DESCRIBED" &&
                              "Không đúng mô tả"}
                            {complaint.category === "OTHER" && "Khác"}
                          </div>
                        )}

                        {complaint.evidenceUrls &&
                          complaint.evidenceUrls.length > 0 && (
                            <div className="mb-2">
                              <strong>Ảnh minh chứng:</strong>
                              <div className="d-flex flex-wrap gap-2 mt-2">
                                {complaint.evidenceUrls.map((url, index) => (
                                  <img
                                    key={index}
                                    src={url}
                                    alt={`Evidence ${index + 1}`}
                                    style={{
                                      width: "100px",
                                      height: "100px",
                                      objectFit: "cover",
                                      borderRadius: "8px",
                                      cursor: "pointer",
                                      border: "1px solid #dee2e6",
                                    }}
                                    onClick={() => window.open(url, "_blank")}
                                  />
                                ))}
                              </div>
                            </div>
                          )}

                        {complaint.contractCode && (
                          <div className="mb-2">
                            <strong>Mã hợp đồng:</strong>{" "}
                            {complaint.contractCode}
                          </div>
                        )}

                        {complaint.staffNotes && (
                          <Alert variant="info" className="mt-2">
                            <strong>Ghi chú của nhân viên:</strong>
                            <p className="mb-0 mt-1">{complaint.staffNotes}</p>
                          </Alert>
                        )}

                        <div className="mt-2">
                          <small className="text-muted">
                            <i className="bi bi-clock me-1"></i>
                            Tạo lúc: {formatDate(complaint.createdAt)}
                          </small>
                          {complaint.updatedAt &&
                            complaint.updatedAt !== complaint.createdAt && (
                              <small className="text-muted ms-3">
                                <i className="bi bi-arrow-repeat me-1"></i>
                                Cập nhật: {formatDate(complaint.updatedAt)}
                              </small>
                            )}
                        </div>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        )}

        {/* Complaint Form Modal */}
        <ComplaintForm
          visible={showComplaintForm}
          onClose={() => setShowComplaintForm(false)}
          onSuccess={loadComplaints}
          userId={user?.id || user?.user?.id}
          complaints={complaints}
        />
      </Container>
    </div>
  );
};

export default MyComplaintsPage;
