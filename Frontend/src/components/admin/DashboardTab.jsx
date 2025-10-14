import { Users, Package, TrendingUp, DollarSign } from "lucide-react";

const DashboardTab = ({ stats, orders }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
      case "completed":
        return "#28a745";
      case "inactive":
      case "cancelled":
        return "#dc3545";
      case "pending":
        return "#ffc107";
      default:
        return "#6c757d";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "active":
        return "Hoạt động";
      case "inactive":
        return "Không hoạt động";
      case "completed":
        return "Hoàn thành";
      case "pending":
        return "Chờ xử lý";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  return (
    <div>
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

      {/* Recent Orders */}
      <div className="card">
        <h3 style={{ marginBottom: "1.5rem", color: "#333" }}>
          Đơn hàng gần đây
        </h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e9ecef" }}>
                <th style={{ padding: "1rem", textAlign: "left" }}>ID</th>
                <th style={{ padding: "1rem", textAlign: "left" }}>
                  Khách hàng
                </th>
                <th style={{ padding: "1rem", textAlign: "left" }}>Sản phẩm</th>
                <th style={{ padding: "1rem", textAlign: "left" }}>Số tiền</th>
                <th style={{ padding: "1rem", textAlign: "left" }}>
                  Trạng thái
                </th>
                <th style={{ padding: "1rem", textAlign: "left" }}>Ngày</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map((order) => (
                <tr
                  key={order.id}
                  style={{ borderBottom: "1px solid #e9ecef" }}
                >
                  <td style={{ padding: "1rem" }}>#{order.id}</td>
                  <td style={{ padding: "1rem" }}>{order.customer}</td>
                  <td style={{ padding: "1rem" }}>{order.product}</td>
                  <td style={{ padding: "1rem" }}>
                    {formatCurrency(order.amount)}
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <span
                      style={{
                        padding: "0.25rem 0.75rem",
                        borderRadius: "15px",
                        fontSize: "0.8rem",
                        backgroundColor: getStatusColor(order.status) + "20",
                        color: getStatusColor(order.status),
                      }}
                    >
                      {getStatusText(order.status)}
                    </span>
                  </td>
                  <td style={{ padding: "1rem" }}>{order.date}</td>
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
