import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import adminService from "../../services/adminService";
import { FileText, CheckCircle, XCircle, RefreshCw, Image as ImageIcon } from "lucide-react";

const EscrowTab = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [manualReleaseLoading, setManualReleaseLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // Load escrow requests
  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await adminService.getSellerEscrowRequests();
      setRequests(response.data || []);
    } catch (error) {
      console.error("Error loading escrow requests:", error);
      toast.error("Lỗi khi tải danh sách yêu cầu escrow!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  // Handle approve
  const handleApprove = async (request) => {
    if (!window.confirm("Bạn có chắc chắn muốn duyệt yêu cầu này không?")) {
      return;
    }

    try {
      setLoading(true);
      await adminService.approveEscrowRequest(request.escrowId);
      toast.success("Đã duyệt yêu cầu và thông báo buyer thành công!");
      await loadRequests(); // Reload danh sách
    } catch (error) {
      console.error("Error approving escrow:", error);
      toast.error(error.response?.data?.message || "Lỗi khi duyệt yêu cầu!");
    } finally {
      setLoading(false);
    }
  };

  // Handle reject
  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối!");
      return;
    }

    try {
      setLoading(true);
      await adminService.rejectEscrowRequest(selectedRequest.escrowId, rejectReason);
      toast.success("Đã từ chối yêu cầu thành công!");
      setShowRejectModal(false);
      setRejectReason("");
      setSelectedRequest(null);
      await loadRequests(); // Reload danh sách
    } catch (error) {
      console.error("Error rejecting escrow:", error);
      toast.error(error.response?.data?.message || "Lỗi khi từ chối yêu cầu!");
    } finally {
      setLoading(false);
    }
  };

  // Handle manual release
  const handleManualRelease = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn release escrow thủ công không? Chỉ release các escrow đủ điều kiện.")) {
      return;
    }

    try {
      setManualReleaseLoading(true);
      const response = await adminService.manualReleaseEscrow();
      const processedCount = response.data || 0;
      toast.success(`Đã xử lý ${processedCount} escrow thành công!`);
      await loadRequests(); // Reload danh sách
    } catch (error) {
      console.error("Error manually releasing escrow:", error);
      toast.error(error.response?.data?.message || "Lỗi khi release escrow!");
    } finally {
      setManualReleaseLoading(false);
    }
  };

  return (
    <div>
      {/* Header Actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <FileText size={24} style={{ color: "#667eea" }} />
          <div>
            <h2 style={{ color: "#ffffff", margin: 0, fontSize: "1.5rem" }}>
              Quản lý Escrow
            </h2>
            <p style={{ color: "rgba(255, 255, 255, 0.6)", margin: "0.25rem 0 0 0", fontSize: "0.9rem" }}>
              Duyệt yêu cầu giải phóng tiền escrow từ seller
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            onClick={loadRequests}
            disabled={loading}
            style={{
              padding: "0.75rem 1.5rem",
              background: "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "10px",
              color: "white",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              transition: "all 0.3s ease",
              backdropFilter: "blur(10px)",
            }}
          >
            <RefreshCw size={18} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
            Làm mới
          </button>

          <button
            onClick={handleManualRelease}
            disabled={manualReleaseLoading}
            style={{
              padding: "0.75rem 1.5rem",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              border: "none",
              borderRadius: "10px",
              color: "white",
              cursor: manualReleaseLoading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              transition: "all 0.3s ease",
              fontWeight: "600",
            }}
          >
            {manualReleaseLoading ? (
              <>
                <RefreshCw size={18} style={{ animation: "spin 1s linear infinite" }} />
                Đang xử lý...
              </>
            ) : (
              <>Release Escrow</>
            )}
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "15px",
            padding: "1.5rem",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#667eea" }}>
            {requests.length}
          </div>
          <div style={{ color: "rgba(255, 255, 255, 0.7)", marginTop: "0.5rem" }}>
            Yêu cầu chờ duyệt
          </div>
        </div>
      </div>

      {/* Requests List */}
      {loading && requests.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "rgba(255, 255, 255, 0.7)" }}>
          <RefreshCw size={48} style={{ animation: "spin 1s linear infinite", marginBottom: "1rem" }} />
          <p>Đang tải danh sách...</p>
        </div>
      ) : requests.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "3rem",
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "15px",
          }}
        >
          <FileText size={48} style={{ color: "rgba(255, 255, 255, 0.3)", marginBottom: "1rem" }} />
          <p style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "1.1rem" }}>
            Không có yêu cầu escrow nào đang chờ duyệt
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gap: "1.5rem",
          }}
        >
          {requests.map((request, index) => (
            <div
              key={index}
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "15px",
                padding: "1.5rem",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                e.currentTarget.style.borderColor = "rgba(102, 126, 234, 0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
              }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr auto", gap: "1.5rem", alignItems: "start" }}>
                {/* Proof Image */}
                <div>
                  <div style={{ marginBottom: "0.5rem", color: "rgba(255, 255, 255, 0.7)", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <ImageIcon size={16} />
                    Ảnh minh chứng
                  </div>
                  {request.sellerProofImage ? (
                    <img
                      src={request.sellerProofImage}
                      alt="Proof"
                      style={{
                        width: "150px",
                        height: "150px",
                        objectFit: "cover",
                        borderRadius: "10px",
                        border: "2px solid rgba(255, 255, 255, 0.2)",
                        cursor: "pointer",
                      }}
                      onClick={() => window.open(request.sellerProofImage, "_blank")}
                    />
                  ) : (
                    <div
                      style={{
                        width: "150px",
                        height: "150px",
                        background: "rgba(255, 255, 255, 0.05)",
                        borderRadius: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "rgba(255, 255, 255, 0.4)",
                        fontSize: "0.9rem",
                      }}
                    >
                      Không có ảnh
                    </div>
                  )}
                </div>

                {/* Request Details */}
                <div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <div>
                      <span style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "0.9rem" }}>
                        Mã đơn hàng:
                      </span>
                      <span style={{ color: "#ffffff", fontSize: "1rem", fontWeight: "600", marginLeft: "0.5rem" }}>
                        #{request.orderId}
                      </span>
                    </div>

                    <div>
                      <span style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "0.9rem" }}>
                        Mã vận chuyển:
                      </span>
                      <span style={{ color: "#ffffff", fontSize: "1rem", fontWeight: "600", marginLeft: "0.5rem" }}>
                        {request.sellerOrderCode || "Không có"}
                      </span>
                    </div>

                    <div>
                      <span style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "0.9rem" }}>
                        Seller ID:
                      </span>
                      <span style={{ color: "#ffffff", fontSize: "1rem", fontWeight: "600", marginLeft: "0.5rem" }}>
                        {request.sellerId}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <button
                    onClick={() => handleApprove(request)}
                    disabled={loading}
                    style={{
                      padding: "0.75rem 1.5rem",
                      background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                      border: "none",
                      borderRadius: "10px",
                      color: "white",
                      cursor: loading ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                      fontWeight: "600",
                      transition: "all 0.3s ease",
                      minWidth: "140px",
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) e.target.style.transform = "translateY(-2px)";
                      if (!loading) e.target.style.boxShadow = "0 5px 20px rgba(67, 233, 123, 0.4)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = "none";
                    }}
                  >
                    <CheckCircle size={18} />
                    Duyệt
                  </button>

                  <button
                    onClick={() => {
                      setSelectedRequest(request);
                      setShowRejectModal(true);
                    }}
                    disabled={loading}
                    style={{
                      padding: "0.75rem 1.5rem",
                      background: "rgba(255, 71, 87, 0.2)",
                      border: "1px solid rgba(255, 71, 87, 0.5)",
                      borderRadius: "10px",
                      color: "#ff4757",
                      cursor: loading ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                      fontWeight: "600",
                      transition: "all 0.3s ease",
                      minWidth: "140px",
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) e.target.style.transform = "translateY(-2px)";
                      if (!loading) e.target.style.background = "rgba(255, 71, 87, 0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "translateY(0)";
                      e.target.style.background = "rgba(255, 71, 87, 0.2)";
                    }}
                  >
                    <XCircle size={18} />
                    Từ chối
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            backdropFilter: "blur(10px)",
          }}
          onClick={() => {
            setShowRejectModal(false);
            setRejectReason("");
            setSelectedRequest(null);
          }}
        >
          <div
            style={{
              background: "rgba(26, 26, 46, 0.95)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "20px",
              padding: "2rem",
              maxWidth: "500px",
              width: "90%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ color: "#ffffff", marginBottom: "1rem", fontSize: "1.5rem" }}>
              Từ chối yêu cầu
            </h3>

            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  display: "block",
                  color: "rgba(255, 255, 255, 0.8)",
                  marginBottom: "0.5rem",
                  fontSize: "0.9rem",
                }}
              >
                Lý do từ chối (bắt buộc):
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Nhập lý do từ chối yêu cầu này..."
                rows={5}
                style={{
                  width: "100%",
                  padding: "1rem",
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "2px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "10px",
                  color: "#ffffff",
                  fontSize: "1rem",
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                  setSelectedRequest(null);
                }}
                disabled={loading}
                style={{
                  padding: "0.75rem 1.5rem",
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "10px",
                  color: "white",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontWeight: "600",
                }}
              >
                Hủy
              </button>

              <button
                onClick={handleReject}
                disabled={loading || !rejectReason.trim()}
                style={{
                  padding: "0.75rem 1.5rem",
                  background: loading || !rejectReason.trim() ? "rgba(255, 71, 87, 0.3)" : "#ff4757",
                  border: "none",
                  borderRadius: "10px",
                  color: "white",
                  cursor: loading || !rejectReason.trim() ? "not-allowed" : "pointer",
                  fontWeight: "600",
                }}
              >
                {loading ? "Đang xử lý..." : "Xác nhận từ chối"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EscrowTab;

