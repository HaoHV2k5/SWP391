import {
  ClipboardList,
  Clock,
  CheckCircle,
  DollarSign,
  TrendingUp,
} from "lucide-react";

const DashboardTab = ({
  stats,
  orders,
  formatCurrency,
  getStatusColor,
  getStatusText,
  getPriorityColor,
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
            {stats.totalOrders}
          </h3>
          <p style={{ color: "rgba(255, 255, 255, 0.7)", margin: 0 }}>
            Tổng đơn hàng
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
            {stats.pendingOrders}
          </h3>
          <p style={{ color: "rgba(255, 255, 255, 0.7)", margin: 0 }}>
            Chờ xử lý
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
            {stats.completedOrders}
          </h3>
          <p style={{ color: "rgba(255, 255, 255, 0.7)", margin: 0 }}>
            Đã hoàn thành
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
            {formatCurrency(stats.totalRevenue)}
          </h3>
          <p style={{ color: "rgba(255, 255, 255, 0.7)", margin: 0 }}>
            Doanh thu
          </p>
        </div>
      </div>

      {/* ======================================== */}
      {/* 📋 RECENT ORDERS - Bảng đơn hàng gần đây */}
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
            Đơn hàng gần đây
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
                  Khách hàng
                </th>
                <th
                  style={{
                    padding: "1rem",
                    textAlign: "left",
                    color: "rgba(255, 255, 255, 0.8)",
                    fontWeight: "600",
                  }}
                >
                  Sản phẩm
                </th>
                <th
                  style={{
                    padding: "1rem",
                    textAlign: "left",
                    color: "rgba(255, 255, 255, 0.8)",
                    fontWeight: "600",
                  }}
                >
                  Số tiền
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
                  Ưu tiên
                </th>
                <th
                  style={{
                    padding: "1rem",
                    textAlign: "left",
                    color: "rgba(255, 255, 255, 0.8)",
                    fontWeight: "600",
                  }}
                >
                  Ngày
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map((order) => (
                <tr
                  key={order.id}
                  style={{
                    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor =
                      "rgba(255, 255, 255, 0.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "transparent";
                  }}
                >
                  <td style={{ padding: "1rem", color: "white" }}>
                    #{order.id}
                  </td>
                  <td style={{ padding: "1rem", color: "white" }}>
                    {order.customer}
                  </td>
                  <td style={{ padding: "1rem", color: "white" }}>
                    {order.product}
                  </td>
                  <td style={{ padding: "1rem", color: "white" }}>
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
                        fontWeight: "500",
                      }}
                    >
                      {getStatusText(order.status)}
                    </span>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <span
                      style={{
                        padding: "0.25rem 0.75rem",
                        borderRadius: "15px",
                        fontSize: "0.8rem",
                        backgroundColor:
                          getPriorityColor(order.priority) + "20",
                        color: getPriorityColor(order.priority),
                        fontWeight: "500",
                      }}
                    >
                      {order.priority === "high" && "Cao"}
                      {order.priority === "medium" && "Trung bình"}
                      {order.priority === "low" && "Thấp"}
                    </span>
                  </td>
                  <td style={{ padding: "1rem", color: "white" }}>
                    {order.date}
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
