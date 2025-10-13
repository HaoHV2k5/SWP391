import {
  ClipboardList,
  Clock,
  CheckCircle,
  DollarSign,
  TrendingUp,
} from "lucide-react";

const DashboardTab = ({
  stats,
  products,
  kycList,
  formatCurrency,
  getStatusColor,
  getStatusText,
}) => {
  return (
    <div>
      {/* STATS CARDS - Cards thống kê */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        <div
          className="card"
          style={{
            textAlign: "center",
            padding: "2rem",
            background: "rgba(26, 26, 46, 0.8)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "15px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
          }}
        >
          <ClipboardList
            size={48}
            style={{ color: "#667eea", marginBottom: "1rem" }}
          />
          <h3
            style={{
              fontSize: "2rem",
              marginBottom: "0.5rem",
              color: "white",
              fontWeight: "700",
            }}
          >
            {stats.totalProducts}
          </h3>
          <p style={{ color: "rgba(255, 255, 255, 0.7)", margin: 0 }}>
            Tổng Tin Đăng
          </p>
        </div>

        <div
          className="card"
          style={{
            textAlign: "center",
            padding: "2rem",
            background: "rgba(26, 26, 46, 0.8)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "15px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
          }}
        >
          <Clock size={48} style={{ color: "#ffc107", marginBottom: "1rem" }} />
          <h3
            style={{
              fontSize: "2rem",
              marginBottom: "0.5rem",
              color: "white",
              fontWeight: "700",
            }}
          >
            {stats.pendingProducts}
          </h3>
          <p style={{ color: "rgba(255, 255, 255, 0.7)", margin: 0 }}>
            Tin Đăng chờ duyệt
          </p>
        </div>

        <div
          className="card"
          style={{
            textAlign: "center",
            padding: "2rem",
            background: "rgba(26, 26, 46, 0.8)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "15px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
          }}
        >
          <CheckCircle
            size={48}
            style={{ color: "#28a745", marginBottom: "1rem" }}
          />
          <h3
            style={{
              fontSize: "2rem",
              marginBottom: "0.5rem",
              color: "white",
              fontWeight: "700",
            }}
          >
            {stats.approvedProducts}
          </h3>
          <p style={{ color: "rgba(255, 255, 255, 0.7)", margin: 0 }}>
            Tin Đăng đã duyệt
          </p>
        </div>

        <div
          className="card"
          style={{
            textAlign: "center",
            padding: "2rem",
            background: "rgba(26, 26, 46, 0.8)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "15px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
          }}
        >
          <DollarSign
            size={48}
            style={{ color: "#dc3545", marginBottom: "1rem" }}
          />
          <h3
            style={{
              fontSize: "2rem",
              marginBottom: "0.5rem",
              color: "white",
              fontWeight: "700",
            }}
          >
            {stats.totalKyc}
          </h3>
          <p style={{ color: "rgba(255, 255, 255, 0.7)", margin: 0 }}>
            Tổng KYC
          </p>
        </div>
      </div>

      {/* ======================================== */}
      {/* 📦 RECENT PRODUCTS - Sản phẩm gần đây */}
      {/* ======================================== */}
      <div
        className="card"
        style={{
          background: "rgba(26, 26, 46, 0.8)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "15px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
          padding: "2rem",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1.5rem",
          }}
        >
          <h3
            style={{
              margin: 0,
              color: "white",
              fontSize: "1.5rem",
              fontWeight: "600",
            }}
          >
            Tin Đăng chờ duyệt gần đây
          </h3>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "rgba(255, 255, 255, 0.7)",
              fontSize: "0.9rem",
            }}
          >
            <TrendingUp size={16} />
            <span>Hiệu suất tốt</span>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{ borderBottom: "2px solid rgba(255, 255, 255, 0.1)" }}
              >
                <th
                  style={{
                    padding: "1rem",
                    textAlign: "left",
                    color: "rgba(255, 255, 255, 0.8)",
                    fontWeight: "600",
                  }}
                >
                  ID
                </th>
                <th
                  style={{
                    padding: "1rem",
                    textAlign: "left",
                    color: "rgba(255, 255, 255, 0.8)",
                    fontWeight: "600",
                  }}
                >
                  Tên
                </th>
                <th
                  style={{
                    padding: "1rem",
                    textAlign: "left",
                    color: "rgba(255, 255, 255, 0.8)",
                    fontWeight: "600",
                  }}
                >
                  Người bán
                </th>
                <th
                  style={{
                    padding: "1rem",
                    textAlign: "left",
                    color: "rgba(255, 255, 255, 0.8)",
                    fontWeight: "600",
                  }}
                >
                  Giá
                </th>
                <th
                  style={{
                    padding: "1rem",
                    textAlign: "left",
                    color: "rgba(255, 255, 255, 0.8)",
                    fontWeight: "600",
                  }}
                >
                  Trạng thái
                </th>
                <th
                  style={{
                    padding: "1rem",
                    textAlign: "left",
                    color: "rgba(255, 255, 255, 0.8)",
                    fontWeight: "600",
                  }}
                >
                  Ngày tạo
                </th>
              </tr>
            </thead>
            <tbody>
              {products.slice(0, 5).map((product) => (
                <tr
                  key={product.id}
                  style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}
                >
                  <td style={{ padding: "1rem", color: "white" }}>
                    #{product.id}
                  </td>
                  <td style={{ padding: "1rem", color: "white" }}>
                    {product.title}
                  </td>
                  <td style={{ padding: "1rem", color: "white" }}>
                    {product.seller}
                  </td>
                  <td style={{ padding: "1rem", color: "white" }}>
                    {formatCurrency(product.price)}
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <span
                      style={{
                        padding: "0.25rem 0.75rem",
                        borderRadius: "15px",
                        fontSize: "0.8rem",
                        backgroundColor: getStatusColor(product.status) + "20",
                        color: getStatusColor(product.status),
                        fontWeight: "500",
                      }}
                    >
                      {getStatusText(product.status)}
                    </span>
                  </td>
                  <td style={{ padding: "1rem", color: "white" }}>
                    {product.createdAt}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================== */}
      {/* RECENT KYC - KYC gần đây */}
      {/* ======================================== */}
      <div
        className="card"
        style={{
          background: "rgba(26, 26, 46, 0.8)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "15px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
          padding: "2rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1.5rem",
          }}
        >
          <h3
            style={{
              margin: 0,
              color: "white",
              fontSize: "1.5rem",
              fontWeight: "600",
            }}
          >
            KYC chờ duyệt gần đây
          </h3>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "rgba(255, 255, 255, 0.7)",
              fontSize: "0.9rem",
            }}
          >
            <TrendingUp size={16} />
            <span>Hiệu suất tốt</span>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{ borderBottom: "2px solid rgba(255, 255, 255, 0.1)" }}
              >
                <th
                  style={{
                    padding: "1rem",
                    textAlign: "left",
                    color: "rgba(255, 255, 255, 0.8)",
                    fontWeight: "600",
                  }}
                >
                  ID
                </th>
                <th
                  style={{
                    padding: "1rem",
                    textAlign: "left",
                    color: "rgba(255, 255, 255, 0.8)",
                    fontWeight: "600",
                  }}
                >
                  Họ tên
                </th>
                <th
                  style={{
                    padding: "1rem",
                    textAlign: "left",
                    color: "rgba(255, 255, 255, 0.8)",
                    fontWeight: "600",
                  }}
                >
                  Email
                </th>
                <th
                  style={{
                    padding: "1rem",
                    textAlign: "left",
                    color: "rgba(255, 255, 255, 0.8)",
                    fontWeight: "600",
                  }}
                >
                  Số điện thoại
                </th>
                <th
                  style={{
                    padding: "1rem",
                    textAlign: "left",
                    color: "rgba(255, 255, 255, 0.8)",
                    fontWeight: "600",
                  }}
                >
                  Trạng thái
                </th>
                <th
                  style={{
                    padding: "1rem",
                    textAlign: "left",
                    color: "rgba(255, 255, 255, 0.8)",
                    fontWeight: "600",
                  }}
                >
                  Ngày nộp
                </th>
              </tr>
            </thead>
            <tbody>
              {kycList.slice(0, 5).map((kyc) => (
                <tr
                  key={kyc.id}
                  style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}
                >
                  <td style={{ padding: "1rem", color: "white" }}>#{kyc.id}</td>
                  <td style={{ padding: "1rem", color: "white" }}>
                    {kyc.fullName}
                  </td>
                  <td style={{ padding: "1rem", color: "white" }}>
                    {kyc.email}
                  </td>
                  <td style={{ padding: "1rem", color: "white" }}>
                    {kyc.phone}
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <span
                      style={{
                        padding: "0.25rem 0.75rem",
                        borderRadius: "15px",
                        fontSize: "0.8rem",
                        backgroundColor: getStatusColor(kyc.status) + "20",
                        color: getStatusColor(kyc.status),
                        fontWeight: "500",
                      }}
                    >
                      {getStatusText(kyc.status)}
                    </span>
                  </td>
                  <td style={{ padding: "1rem", color: "white" }}>
                    {kyc.submittedAt}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardTab;
