import { Filter, Download, Eye, Edit } from "lucide-react";

const OrdersTab = ({
  orders,
  formatCurrency,
  getStatusColor,
  getStatusText,
  getPriorityColor,
}) => {
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
        <h3>Danh sách Tin đăng</h3>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button className="staff-btn staff-btn-secondary">
            <Filter size={16} />
            Lọc
          </button>
          <button className="staff-btn staff-btn-primary">
            <Download size={16} />
            Xuất báo cáo
          </button>
        </div>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e9ecef" }}>
              <th style={{ padding: "1rem", textAlign: "left" }}>ID</th>
              <th style={{ padding: "1rem", textAlign: "left" }}>Khách hàng</th>
              <th style={{ padding: "1rem", textAlign: "left" }}>Sản phẩm</th>
              <th style={{ padding: "1rem", textAlign: "left" }}>Số tiền</th>
              <th style={{ padding: "1rem", textAlign: "left" }}>Trạng thái</th>
              <th style={{ padding: "1rem", textAlign: "left" }}>Ưu tiên</th>
              <th style={{ padding: "1rem", textAlign: "left" }}>Ngày</th>
              <th style={{ padding: "1rem", textAlign: "left" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} style={{ borderBottom: "1px solid #e9ecef" }}>
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
                <td style={{ padding: "1rem" }}>
                  <span
                    style={{
                      padding: "0.25rem 0.75rem",
                      borderRadius: "15px",
                      fontSize: "0.8rem",
                      backgroundColor: getPriorityColor(order.priority) + "20",
                      color: getPriorityColor(order.priority),
                    }}
                  >
                    {order.priority === "high" && "Cao"}
                    {order.priority === "medium" && "Trung bình"}
                    {order.priority === "low" && "Thấp"}
                  </span>
                </td>
                <td style={{ padding: "1rem" }}>{order.date}</td>
                <td style={{ padding: "1rem" }}>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button className="staff-action-btn" title="Xem chi tiết">
                      <Eye size={16} />
                    </button>
                    <button
                      className="staff-action-btn"
                      title="Cập nhật trạng thái"
                    >
                      <Edit size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdersTab;
