import { useState, useEffect } from "react";
import { Wallet, CheckCircle, XCircle, Clock, RefreshCw, ChevronLeft, ChevronRight, Eye, Filter } from "lucide-react";
import withdrawalService from "../../services/withdrawalService";
import { toast } from "react-toastify";

const WithdrawalTab = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const [withdrawals, setWithdrawals] = useState([]);
  const [filteredWithdrawals, setFilteredWithdrawals] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [withdrawalToReject, setWithdrawalToReject] = useState(null);
  
  const itemsPerPage = 10;

  useEffect(() => {
    // Chỉ load khi user đã có (tránh load ngay khi mount)
    if (user?.id) {
      loadWithdrawals();
    }
  }, [user]);

  useEffect(() => {
    filterWithdrawals();
  }, [selectedStatus, withdrawals]);

  const loadWithdrawals = async () => {
    try {
      setLoading(true);
      const response = await withdrawalService.getAllWithdrawals();
      const withdrawalsList = response?.data || response || [];
      setWithdrawals(withdrawalsList);
    } catch (error) {
      console.error("Error loading withdrawals:", error);
      toast.error("Lỗi khi tải danh sách yêu cầu rút tiền!");
    } finally {
      setLoading(false);
    }
  };

  const filterWithdrawals = () => {
    let filtered = [...withdrawals];
    
    if (selectedStatus !== "ALL") {
      filtered = filtered.filter(w => 
        (w.status || "").toUpperCase() === selectedStatus.toUpperCase()
      );
    }
    
    setFilteredWithdrawals(filtered);
    setCurrentPage(1); // Reset về trang đầu khi filter
  };

  const handleConfirm = async (withdrawalId) => {
    if (!user || !user.id) {
      toast.error("Không tìm thấy thông tin admin!");
      return;
    }

    try {
      setLoading(true);
      await withdrawalService.confirmWithdrawal(withdrawalId, user.id);
      toast.success("Xác nhận rút tiền thành công!");
      loadWithdrawals();
    } catch (error) {
      console.error("Error confirming withdrawal:", error);
      toast.error(
        `Lỗi khi xác nhận: ${error.response?.data?.message || error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  const openRejectModal = (withdrawal) => {
    setWithdrawalToReject(withdrawal);
    setRejectReason("");
    setShowRejectModal(true);
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
    setWithdrawalToReject(null);
    setRejectReason("");
  };

  const handleReject = async () => {
    if (!withdrawalToReject || !user || !user.id) {
      toast.error("Thông tin không hợp lệ!");
      return;
    }

    if (!rejectReason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối!");
      return;
    }

    try {
      setLoading(true);
      await withdrawalService.rejectWithdrawal(
        withdrawalToReject.id,
        user.id,
        rejectReason
      );
      toast.success("Từ chối yêu cầu rút tiền thành công!");
      closeRejectModal();
      loadWithdrawals();
    } catch (error) {
      console.error("Error rejecting withdrawal:", error);
      toast.error(
        `Lỗi khi từ chối: ${error.response?.data?.message || error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  const openDetailModal = async (withdrawal) => {
    try {
      setLoading(true);
      const response = await withdrawalService.getWithdrawalDetail(withdrawal.id);
      setSelectedWithdrawal(response?.data || withdrawal);
      setShowDetailModal(true);
    } catch (error) {
      console.error("Error fetching withdrawal detail:", error);
      toast.error("Lỗi khi tải chi tiết yêu cầu!");
      setSelectedWithdrawal(withdrawal);
      setShowDetailModal(true);
    } finally {
      setLoading(false);
    }
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedWithdrawal(null);
  };

  const getStatusColor = (status) => {
    const statusUpper = (status || "").toUpperCase();
    switch (statusUpper) {
      case "PENDING":
        return "#ffc107";
      case "COMPLETED":
        return "#28a745";
      case "CANCELLED":
      case "FAILED":
        return "#dc3545";
      default:
        return "#6c757d";
    }
  };

  const getStatusLabel = (status) => {
    const statusUpper = (status || "").toUpperCase();
    switch (statusUpper) {
      case "PENDING":
        return "Đang chờ";
      case "COMPLETED":
        return "Hoàn thành";
      case "CANCELLED":
        return "Đã hủy";
      case "FAILED":
        return "Thất bại";
      default:
        return status || "Không xác định";
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return "0 VNĐ";
    return new Intl.NumberFormat("vi-VN").format(amount) + " VNĐ";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa có";
    try {
      return new Date(dateString).toLocaleString("vi-VN");
    } catch {
      return "Chưa có";
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredWithdrawals.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentWithdrawals = filteredWithdrawals.slice(startIndex, endIndex);

  // Stats
  const stats = {
    total: withdrawals.length,
    pending: withdrawals.filter(w => (w.status || "").toUpperCase() === "PENDING").length,
    completed: withdrawals.filter(w => (w.status || "").toUpperCase() === "COMPLETED").length,
    cancelled: withdrawals.filter(w => (w.status || "").toUpperCase() === "CANCELLED").length,
  };

  if (loading && withdrawals.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "3rem", color: "white" }}>
        <RefreshCw size={32} className="spin" />
        <div style={{ marginTop: "1rem" }}>Đang tải danh sách yêu cầu rút tiền...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Stats Cards */}
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
            backgroundColor: "rgba(108, 117, 125, 0.2)",
            padding: "1.5rem",
            borderRadius: "12px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Wallet size={24} color="#6c757d" />
            <div>
              <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)" }}>
                Tổng yêu cầu
              </div>
              <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "white" }}>
                {stats.total}
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: "rgba(255, 193, 7, 0.2)",
            padding: "1.5rem",
            borderRadius: "12px",
            border: "1px solid rgba(255, 193, 7, 0.3)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Clock size={24} color="#ffc107" />
            <div>
              <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)" }}>
                Đang chờ
              </div>
              <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "white" }}>
                {stats.pending}
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: "rgba(40, 167, 69, 0.2)",
            padding: "1.5rem",
            borderRadius: "12px",
            border: "1px solid rgba(40, 167, 69, 0.3)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <CheckCircle size={24} color="#28a745" />
            <div>
              <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)" }}>
                Hoàn thành
              </div>
              <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "white" }}>
                {stats.completed}
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: "rgba(220, 53, 69, 0.2)",
            padding: "1.5rem",
            borderRadius: "12px",
            border: "1px solid rgba(220, 53, 69, 0.3)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <XCircle size={24} color="#dc3545" />
            <div>
              <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)" }}>
                Đã hủy
              </div>
              <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "white" }}>
                {stats.cancelled}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter và Actions */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Filter size={20} color="rgba(255,255,255,0.8)" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: "white",
              fontSize: "0.9rem",
              cursor: "pointer",
            }}
          >
            <option value="ALL" style={{ color: "#333" }}>Tất cả</option>
            <option value="PENDING" style={{ color: "#333" }}>Đang chờ</option>
            <option value="COMPLETED" style={{ color: "#333" }}>Hoàn thành</option>
            <option value="CANCELLED" style={{ color: "#333" }}>Đã hủy</option>
          </select>
        </div>

        <button
          onClick={loadWithdrawals}
          disabled={loading}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "8px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            opacity: loading ? 0.6 : 1,
          }}
        >
          <RefreshCw size={16} className={loading ? "spin" : ""} />
          Làm mới
        </button>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid rgba(255,255,255,0.1)" }}>
              <th style={{ padding: "1rem", textAlign: "left" }}>ID</th>
              <th style={{ padding: "1rem", textAlign: "left" }}>Mã GD</th>
              <th style={{ padding: "1rem", textAlign: "left" }}>Số tiền</th>
              <th style={{ padding: "1rem", textAlign: "left" }}>Ngân hàng</th>
              <th style={{ padding: "1rem", textAlign: "left" }}>STK</th>
              <th style={{ padding: "1rem", textAlign: "left" }}>Chủ TK</th>
              <th style={{ padding: "1rem", textAlign: "left" }}>Trạng thái</th>
              <th style={{ padding: "1rem", textAlign: "left" }}>Ngày tạo</th>
              <th style={{ padding: "1rem", textAlign: "left" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {currentWithdrawals.length === 0 ? (
              <tr>
                <td
                  colSpan="9"
                  style={{ padding: "2rem", textAlign: "center", color: "rgba(255,255,255,0.6)" }}
                >
                  Không có yêu cầu rút tiền nào
                </td>
              </tr>
            ) : (
              currentWithdrawals.map((withdrawal) => {
                const isPending = (withdrawal.status || "").toUpperCase() === "PENDING";
                return (
                  <tr
                    key={withdrawal.id}
                    style={{
                      borderBottom: "1px solid rgba(255,255,255,0.1)",
                      transition: "background-color 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <td style={{ padding: "1rem" }}>#{withdrawal.id}</td>
                    <td style={{ padding: "1rem" }}>
                      {withdrawal.transactionCode || "N/A"}
                    </td>
                    <td style={{ padding: "1rem", fontWeight: "600" }}>
                      {formatCurrency(withdrawal.amount)}
                    </td>
                    <td style={{ padding: "1rem" }}>
                      {withdrawal.bankInfo || "N/A"}
                    </td>
                    <td style={{ padding: "1rem" }}>
                      {withdrawal.accountNumber || "N/A"}
                    </td>
                    <td style={{ padding: "1rem" }}>
                      {withdrawal.accountHolderName || "N/A"}
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <span
                        style={{
                          padding: "0.25rem 0.75rem",
                          borderRadius: "15px",
                          fontSize: "0.8rem",
                          backgroundColor: getStatusColor(withdrawal.status) + "20",
                          color: getStatusColor(withdrawal.status),
                          fontWeight: "600",
                        }}
                      >
                        {getStatusLabel(withdrawal.status)}
                      </span>
                    </td>
                    <td style={{ padding: "1rem", fontSize: "0.9rem" }}>
                      {formatDate(withdrawal.createdAt)}
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          onClick={() => openDetailModal(withdrawal)}
                          title="Xem chi tiết"
                          style={{
                            padding: "0.5rem",
                            backgroundColor: "#17a2b8",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                          }}
                        >
                          <Eye size={16} />
                        </button>
                        {isPending && (
                          <>
                            <button
                              onClick={() => handleConfirm(withdrawal.id)}
                              disabled={loading}
                              title="Xác nhận"
                              style={{
                                padding: "0.5rem",
                                backgroundColor: "#28a745",
                                color: "white",
                                border: "none",
                                borderRadius: "6px",
                                cursor: loading ? "not-allowed" : "pointer",
                                opacity: loading ? 0.6 : 1,
                              }}
                            >
                              <CheckCircle size={16} />
                            </button>
                            <button
                              onClick={() => openRejectModal(withdrawal)}
                              disabled={loading}
                              title="Từ chối"
                              style={{
                                padding: "0.5rem",
                                backgroundColor: "#dc3545",
                                color: "white",
                                border: "none",
                                borderRadius: "6px",
                                cursor: loading ? "not-allowed" : "pointer",
                                opacity: loading ? 0.6 : 1,
                              }}
                            >
                              <XCircle size={16} />
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
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "0.5rem",
            marginTop: "2rem",
          }}
        >
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              backgroundColor: currentPage === 1 ? "rgba(255,255,255,0.1)" : "#007bff",
              color: "white",
              border: "none",
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
            }}
          >
            <ChevronLeft size={16} />
          </button>
          
          <span style={{ color: "white", padding: "0 1rem" }}>
            Trang {currentPage} / {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              backgroundColor: currentPage === totalPages ? "rgba(255,255,255,0.1)" : "#007bff",
              color: "white",
              border: "none",
              cursor: currentPage === totalPages ? "not-allowed" : "pointer",
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedWithdrawal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={closeDetailModal}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "2rem",
              borderRadius: "12px",
              width: "600px",
              maxWidth: "90vw",
              maxHeight: "90vh",
              overflowY: "auto",
              color: "#333",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: "1.5rem", color: "#333" }}>
              Chi tiết yêu cầu rút tiền
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <strong>ID:</strong> #{selectedWithdrawal.id}
              </div>
              <div>
                <strong>Mã giao dịch:</strong> {selectedWithdrawal.transactionCode || "N/A"}
              </div>
              <div>
                <strong>Số tiền:</strong> {formatCurrency(selectedWithdrawal.amount)}
              </div>
              <div>
                <strong>Số dư trước:</strong> {formatCurrency(selectedWithdrawal.balanceBefore)}
              </div>
              <div>
                <strong>Số dư sau:</strong> {formatCurrency(selectedWithdrawal.balanceAfter)}
              </div>
              <div>
                <strong>Ngân hàng:</strong> {selectedWithdrawal.bankInfo || "N/A"}
              </div>
              <div>
                <strong>Số tài khoản:</strong> {selectedWithdrawal.accountNumber || "N/A"}
              </div>
              <div>
                <strong>Chủ tài khoản:</strong> {selectedWithdrawal.accountHolderName || "N/A"}
              </div>
              <div>
                <strong>Trạng thái:</strong>{" "}
                <span
                  style={{
                    padding: "0.25rem 0.75rem",
                    borderRadius: "15px",
                    fontSize: "0.85rem",
                    backgroundColor: getStatusColor(selectedWithdrawal.status) + "20",
                    color: getStatusColor(selectedWithdrawal.status),
                    fontWeight: "600",
                  }}
                >
                  {getStatusLabel(selectedWithdrawal.status)}
                </span>
              </div>
              <div>
                <strong>Ghi chú:</strong> {selectedWithdrawal.note || "Không có"}
              </div>
              <div>
                <strong>Ngày tạo:</strong> {formatDate(selectedWithdrawal.createdAt)}
              </div>
              {selectedWithdrawal.completedAt && (
                <div>
                  <strong>Ngày hoàn thành:</strong> {formatDate(selectedWithdrawal.completedAt)}
                </div>
              )}
            </div>

            <div style={{ marginTop: "2rem", display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={closeDetailModal}
                style={{
                  padding: "0.75rem 1.5rem",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && withdrawalToReject && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={closeRejectModal}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "2rem",
              borderRadius: "12px",
              width: "500px",
              maxWidth: "90vw",
              color: "#333",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: "1rem", color: "#333" }}>
              Từ chối yêu cầu rút tiền
            </h3>
            <p style={{ marginBottom: "1rem", color: "#666" }}>
              Yêu cầu: {formatCurrency(withdrawalToReject.amount)}
            </p>
            
            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "bold",
                }}
              >
                Lý do từ chối: *
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Nhập lý do từ chối..."
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "2px solid #e9ecef",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  minHeight: "100px",
                  resize: "vertical",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
              <button
                onClick={closeRejectModal}
                disabled={loading}
                style={{
                  padding: "0.75rem 1.5rem",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.6 : 1,
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleReject}
                disabled={loading || !rejectReason.trim()}
                style={{
                  padding: "0.75rem 1.5rem",
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: loading || !rejectReason.trim() ? "not-allowed" : "pointer",
                  opacity: loading || !rejectReason.trim() ? 0.6 : 1,
                }}
              >
                {loading ? "Đang xử lý..." : "Từ chối"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default WithdrawalTab;
