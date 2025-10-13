import { Eye, Check, X, Clock } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

const CustomersTab = ({
  kycList,
  setKycList,
  getStatusColor,
  getStatusText,
  loading,
  setLoading,
}) => {
  const [selectedKyc, setSelectedKyc] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // Hàm duyệt KYC
  const handleApproveKyc = async (kycId) => {
    setLoading(true);
    try {
      // Gọi API duyệt KYC
      // await fetch(`http://localhost:3979/kyc/${kycId}/staff/approve`, {
      //   method: 'POST',
      //   headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      // });

      // Cập nhật state (mock)
      setKycList(
        kycList.map((k) =>
          k.id === kycId ? { ...k, status: "STAFF_APPROVED" } : k
        )
      );
      toast.success("Duyệt KYC thành công!");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi duyệt KYC");
    } finally {
      setLoading(false);
    }
  };

  // Hàm từ chối KYC
  const handleRejectKyc = async (kycId, reason) => {
    setLoading(true);
    try {
      // Gọi API từ chối KYC
      // await fetch(`http://localhost:3979/kyc/${kycId}/reject`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({ reason })
      // });

      // Cập nhật state (mock)
      setKycList(
        kycList.map((k) =>
          k.id === kycId ? { ...k, status: "REJECTED", reason } : k
        )
      );
      toast.success("Từ chối KYC thành công!");
      setShowRejectModal(false);
      setRejectReason("");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi từ chối KYC");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="staff-card">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <h3>Duyệt KYC chờ phê duyệt</h3>
        <div style={{ display: "flex", gap: "1rem" }}>
          <span style={{ color: "#666", fontSize: "0.9rem" }}>
            Tổng: {kycList.length} KYC
          </span>
        </div>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e9ecef" }}>
              <th style={{ padding: "1rem", textAlign: "left" }}>ID</th>
              <th style={{ padding: "1rem", textAlign: "left" }}>Họ tên</th>
              <th style={{ padding: "1rem", textAlign: "left" }}>Email</th>
              <th style={{ padding: "1rem", textAlign: "left" }}>
                Số điện thoại
              </th>
              <th style={{ padding: "1rem", textAlign: "left" }}>Trạng thái</th>
              <th style={{ padding: "1rem", textAlign: "left" }}>Ngày nộp</th>
              <th style={{ padding: "1rem", textAlign: "left" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {kycList.map((kyc) => (
              <tr key={kyc.id} style={{ borderBottom: "1px solid #e9ecef" }}>
                <td style={{ padding: "1rem" }}>#{kyc.id}</td>
                <td style={{ padding: "1rem" }}>{kyc.fullName}</td>
                <td style={{ padding: "1rem" }}>{kyc.email}</td>
                <td style={{ padding: "1rem" }}>{kyc.phone}</td>
                <td style={{ padding: "1rem" }}>
                  <span
                    style={{
                      padding: "0.25rem 0.75rem",
                      borderRadius: "15px",
                      fontSize: "0.8rem",
                      backgroundColor: getStatusColor(kyc.status) + "20",
                      color: getStatusColor(kyc.status),
                    }}
                  >
                    {getStatusText(kyc.status)}
                  </span>
                </td>
                <td style={{ padding: "1rem" }}>{kyc.submittedAt}</td>
                <td style={{ padding: "1rem" }}>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      className="staff-btn staff-btn-secondary"
                      style={{ padding: "0.25rem 0.5rem" }}
                      onClick={() => setSelectedKyc(kyc)}
                    >
                      <Eye size={14} />
                    </button>
                    {kyc.status === "PENDING" && (
                      <>
                        <button
                          className="staff-btn staff-btn-success"
                          style={{ padding: "0.25rem 0.5rem" }}
                          onClick={() => handleApproveKyc(kyc.id)}
                          disabled={loading}
                        >
                          <Check size={14} />
                        </button>
                        <button
                          className="staff-btn staff-btn-danger"
                          style={{ padding: "0.25rem 0.5rem" }}
                          onClick={() => setShowRejectModal(true)}
                          disabled={loading}
                        >
                          <X size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal xem chi tiết KYC */}
      {selectedKyc && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "darkslateblue",
              padding: "2rem",
              borderRadius: "8px",
              maxWidth: "600px",
              width: "90%",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
          >
            <h3 style={{ marginBottom: "1rem" }}>Chi tiết KYC</h3>
            <div style={{ marginBottom: "1rem" }}>
              <strong>Họ tên:</strong> {selectedKyc.fullName}
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <strong>Email:</strong> {selectedKyc.email}
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <strong>Số điện thoại:</strong> {selectedKyc.phone}
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <strong>Trạng thái:</strong>
              <span
                style={{
                  padding: "0.25rem 0.75rem",
                  borderRadius: "15px",
                  fontSize: "0.8rem",
                  backgroundColor: getStatusColor(selectedKyc.status) + "20",
                  color: getStatusColor(selectedKyc.status),
                  marginLeft: "0.5rem",
                }}
              >
                {getStatusText(selectedKyc.status)}
              </span>
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <strong>Ngày nộp:</strong> {selectedKyc.submittedAt}
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <strong>Ảnh CCCD mặt trước:</strong>
              <div style={{ marginTop: "0.5rem" }}>
                <img
                  src={`/images/${selectedKyc.frontImage}`}
                  alt="CCCD mặt trước"
                  style={{
                    maxWidth: "200px",
                    height: "auto",
                    border: "1px solid #ddd",
                  }}
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "block";
                  }}
                />
                <div
                  style={{
                    display: "none",
                    padding: "1rem",
                    border: "1px solid #ddd",
                    backgroundColor: "peachpuff",
                  }}
                >
                  Ảnh không khả dụng
                </div>
              </div>
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <strong>Ảnh CCCD mặt sau:</strong>
              <div style={{ marginTop: "0.5rem" }}>
                <img
                  src={`/images/${selectedKyc.backImage}`}
                  alt="CCCD mặt sau"
                  style={{
                    maxWidth: "200px",
                    height: "auto",
                    border: "1px solid #ddd",
                  }}
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "block";
                  }}
                />
                <div
                  style={{
                    display: "none",
                    padding: "1rem",
                    border: "1px solid #ddd",
                    backgroundColor: "peachpuff",
                  }}
                >
                  Ảnh không khả dụng
                </div>
              </div>
            </div>
            {selectedKyc.reason && (
              <div style={{ marginBottom: "1rem" }}>
                <strong>Lý do từ chối:</strong> {selectedKyc.reason}
              </div>
            )}
            <div
              style={{
                display: "flex",
                gap: "1rem",
                justifyContent: "flex-end",
              }}
            >
              <button
                className="staff-btn staff-btn-secondary"
                onClick={() => setSelectedKyc(null)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal từ chối KYC */}
      {showRejectModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "rosybrown",
              padding: "2rem",
              borderRadius: "8px",
              maxWidth: "400px",
              width: "90%",
            }}
          >
            <h3 style={{ marginBottom: "1rem" }}>Từ chối KYC</h3>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>
                Lý do từ chối:
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  minHeight: "100px",
                }}
                placeholder="Nhập lý do từ chối KYC..."
              />
            </div>
            <div
              style={{
                display: "flex",
                gap: "1rem",
                justifyContent: "flex-end",
              }}
            >
              <button
                className="staff-btn staff-btn-secondary"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                }}
              >
                Hủy
              </button>
              <button
                className="staff-btn staff-btn-danger"
                onClick={() => {
                  if (rejectReason.trim()) {
                    handleRejectKyc(selectedKyc?.id || 1, rejectReason);
                  } else {
                    toast.error("Vui lòng nhập lý do từ chối");
                  }
                }}
                disabled={loading}
              >
                Từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersTab;
