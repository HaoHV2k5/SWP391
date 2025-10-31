import React, { useState, useEffect } from "react";
import { Card, Spinner, Alert } from "react-bootstrap";
import complaintService from "../../services/complaintService";

const ComplaintsAboutMe = ({ user }) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.id) {
      loadComplaints();
    }
  }, [user]);

  const loadComplaints = async () => {
    setLoading(true);
    setError(null);
    
    const result = await complaintService.getComplaintsAboutMe();
    
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
      OPEN: { variant: "warning", text: "Đang mở" },
      UNDER_REVIEW: { variant: "info", text: "Đang xem xét" },
      RESOLVED: { variant: "success", text: "Đã giải quyết" },
      CLOSED: { variant: "secondary", text: "Đã đóng" },
    };
    
    const config = statusConfig[status] || { variant: "secondary", text: status };
    return (
      <span className={`badge bg-${config.variant}`}>{config.text}</span>
    );
  };

  if (loading) {
    return (
      <Card className="mb-4">
        <Card.Body className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </Spinner>
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-4">
        <Card.Body>
          <Alert variant="danger">{error}</Alert>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <Card.Header className="bg-white">
        <h5 className="mb-0">
          <i className="bi bi-exclamation-triangle-fill me-2 text-warning"></i>
          Khiếu nại về tôi
        </h5>
        <small className="text-muted">
          Các khiếu nại mà người mua đã gửi về bạn
        </small>
      </Card.Header>
      <Card.Body>
        {complaints.length === 0 ? (
          <div className="text-center py-4">
            <i className="bi bi-check-circle-fill text-success" style={{ fontSize: "3rem" }}></i>
            <p className="mt-3 text-muted">Chưa có khiếu nại nào về bạn</p>
          </div>
        ) : (
          <div>
            <div className="mb-3">
              <strong>Tổng số khiếu nại: </strong>
              <span className="badge bg-primary">{complaints.length}</span>
            </div>
            
            {complaints.map((complaint) => (
              <Card key={complaint.id} className="mb-3 border-start border-4 border-warning">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <h6 className="mb-1">
                        Khiếu nại #{complaint.id}
                      </h6>
                      <small className="text-muted">
                        Từ người mua: <strong>{complaint.buyerName || complaint.buyer?.fullname || "N/A"}</strong>
                      </small>
                    </div>
                    {getStatusBadge(complaint.status)}
                  </div>
                  
                  {complaint.subject && (
                    <div className="mb-2">
                      <strong>Tiêu đề:</strong> {complaint.subject}
                    </div>
                  )}
                  
                  {complaint.description && (
                    <div className="mb-2">
                      <strong>Nội dung:</strong>
                      <p className="mb-0 mt-1" style={{ whiteSpace: "pre-wrap" }}>
                        {complaint.description}
                      </p>
                    </div>
                  )}
                  
                  {complaint.orderId && (
                    <div className="mb-2">
                      <strong>Đơn hàng ID:</strong> {complaint.orderId}
                    </div>
                  )}
                  
                  {complaint.adminResponse && (
                    <Alert variant="info" className="mt-2">
                      <strong>Phản hồi từ Admin:</strong>
                      <p className="mb-0 mt-1">{complaint.adminResponse}</p>
                    </Alert>
                  )}
                  
                  <div className="mt-2">
                    <small className="text-muted">
                      <i className="bi bi-clock me-1"></i>
                      Tạo lúc: {formatDate(complaint.createdAt)}
                    </small>
                    {complaint.updatedAt && complaint.updatedAt !== complaint.createdAt && (
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
  );
};

export default ComplaintsAboutMe;

