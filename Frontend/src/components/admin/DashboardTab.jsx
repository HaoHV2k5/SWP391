import { useState } from "react";
import {
  Users,
  Package,
  TrendingUp,
  DollarSign,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const DashboardTab = ({ stats, users = [] }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Pagination logic
  const totalPages = Math.ceil(users.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = users.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
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
      {/* Stats Cards */}
      <div className="grid grid-2" style={{ marginBottom: "2rem" }}>
        <div className="card" style={{ textAlign: "center" }}>
          <Users size={48} style={{ color: "#667eea", marginBottom: "1rem" }} />
          <h3
            style={{
              fontSize: "2rem",
              marginBottom: "0.5rem",
              color: "#333",
            }}
          >
            {stats.totalUsers.toLocaleString()}
          </h3>
          <p style={{ color: "#666" }}>Tổng người dùng</p>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <Package
            size={48}
            style={{ color: "#28a745", marginBottom: "1rem" }}
          />
          <h3
            style={{
              fontSize: "2rem",
              marginBottom: "0.5rem",
              color: "#333",
            }}
          >
            {stats.totalProducts}
          </h3>
          <p style={{ color: "#666" }}>Sản phẩm</p>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <DollarSign
            size={48}
            style={{ color: "#ffc107", marginBottom: "1rem" }}
          />
          <h3
            style={{
              fontSize: "2rem",
              marginBottom: "0.5rem",
              color: "#333",
            }}
          >
            {stats.totalOrders}
          </h3>
          <p style={{ color: "#666" }}>Đơn hàng</p>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <TrendingUp
            size={48}
            style={{ color: "#dc3545", marginBottom: "1rem" }}
          />
          <h3
            style={{
              fontSize: "2rem",
              marginBottom: "0.5rem",
              color: "#333",
            }}
          >
            {formatCurrency(stats.totalRevenue)}
          </h3>
          <p style={{ color: "#666" }}>Doanh thu</p>
        </div>
      </div>

      {/* Recent Users */}
      <div className="card">
        <h3 style={{ marginBottom: "1.5rem", color: "#333" }}>
          Người dùng gần đây
        </h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e9ecef" }}>
                <th style={{ padding: "1rem", textAlign: "left" }}>ID</th>
                <th style={{ padding: "1rem", textAlign: "left" }}>Tên</th>
                <th style={{ padding: "1rem", textAlign: "left" }}>Email</th>
                <th style={{ padding: "1rem", textAlign: "left" }}>
                  Số điện thoại
                </th>
                <th style={{ padding: "1rem", textAlign: "left" }}>
                  Trạng thái
                </th>
                <th style={{ padding: "1rem", textAlign: "left" }}>
                  Ngày tham gia
                </th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user) => (
                <tr key={user.id} style={{ borderBottom: "1px solid #e9ecef" }}>
                  <td style={{ padding: "1rem" }}>#{user.id}</td>
                  <td style={{ padding: "1rem" }}>
                    {user.fullname || user.name || "Chưa có tên"}
                  </td>
                  <td style={{ padding: "1rem" }}>{user.email}</td>
                  <td style={{ padding: "1rem" }}>{user.phone || "Chưa có"}</td>
                  <td style={{ padding: "1rem" }}>
                    <span
                      style={{
                        padding: "0.25rem 0.75rem",
                        borderRadius: "15px",
                        fontSize: "0.8rem",
                        backgroundColor:
                          user.status || user.isActive
                            ? "#28a74520"
                            : "#dc354520",
                        color:
                          user.status || user.isActive ? "#28a745" : "#dc3545",
                      }}
                    >
                      {user.status || user.isActive
                        ? "Hoạt động"
                        : "Không hoạt động"}
                    </span>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("vi-VN")
                      : "Chưa có"}
                  </td>
                </tr>
              ))}
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
              marginTop: "1.5rem",
              paddingTop: "1rem",
              borderTop: "1px solid #e9ecef",
            }}
          >
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              style={{
                padding: "0.5rem",
                border: "1px solid #e9ecef",
                borderRadius: "8px",
                background: currentPage === 1 ? "#f8f9fa" : "white",
                color: currentPage === 1 ? "#6c757d" : "#333",
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
              }}
            >
              <ChevronLeft size={16} />
              Trước
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                style={{
                  padding: "0.5rem 0.75rem",
                  border: "1px solid #e9ecef",
                  borderRadius: "8px",
                  background: currentPage === page ? "#667eea" : "white",
                  color: currentPage === page ? "white" : "#333",
                  cursor: "pointer",
                  fontWeight: currentPage === page ? "600" : "normal",
                }}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{
                padding: "0.5rem",
                border: "1px solid #e9ecef",
                borderRadius: "8px",
                background: currentPage === totalPages ? "#f8f9fa" : "white",
                color: currentPage === totalPages ? "#6c757d" : "#333",
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
              }}
            >
              Sau
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardTab;
