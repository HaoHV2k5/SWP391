import { useState } from "react";
// Icons removed - no longer using lucide-react icons

const OrdersTab = ({ orders, formatCurrency }) => {
  const [selectedStatus, setSelectedStatus] = useState("");
  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "#28a745";
      case "shipping":
        return "#ffc107";
      case "pending":
        return "#17a2b8";
      case "cancelled":
        return "#dc3545";
      default:
        return "#6c757d";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "completed":
        return "Hoàn thành";
      case "shipping":
        return "Đang giao";
      case "pending":
        return "Chờ xử lý";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  // getStatusIcon function removed - no longer using icons

  // Lọc đơn hàng theo trạng thái được chọn
  const filteredOrders = selectedStatus 
    ? orders.filter(order => order.status === selectedStatus)
    : orders;

  return (
    <div className="member-card" style={{ padding: "2rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <h3 style={{ color: "#333", margin: 0 }}>Đơn hàng của tôi</h3>
        <div style={{ display: "flex", gap: "1rem" }}>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{
              padding: "0.5rem 1rem",
              border: "1px solid #ddd",
              borderRadius: "8px",
              background: "white",
              color: "#333",
              fontSize: "14px",
              fontFamily: "inherit",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Chờ xử lý</option>
            <option value="shipping">Đang giao</option>
            <option value="completed">Hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {filteredOrders.length === 0 ? (
          <div style={{ 
            textAlign: "center", 
            padding: "3rem", 
            color: "#666",
            fontSize: "1.1rem"
          }}>
            {selectedStatus ? "Không có đơn hàng nào với trạng thái này" : "Chưa có đơn hàng nào"}
          </div>
        ) : (
          filteredOrders.map((order) => (
          <div
            key={order.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1.5rem",
              padding: "1.5rem",
              background: "#f8f9fa",
              borderRadius: "12px",
              border: "1px solid #e9ecef",
              transition: "all 0.3s ease",
            }}
          >
            <img
              src={order.image}
              alt={order.product}
              style={{
                width: "80px",
                height: "80px",
                objectFit: "cover",
                borderRadius: "10px",
              }}
            />
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: "0 0 0.5rem 0", color: "#333" }}>
                Đơn hàng #{order.id}
              </h4>
              <h5 style={{ margin: "0 0 0.5rem 0", color: "#555" }}>
                {order.product}
              </h5>
              <p style={{ margin: "0 0 0.5rem 0", color: "#666", fontSize: "0.9rem" }}>
                Ngày đặt: {order.date}
              </p>
              <p style={{ margin: 0, fontWeight: "600", color: "#333" }}>
                {formatCurrency(order.price)}
              </p>
            </div>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  padding: "0.75rem 1.5rem",
                  borderRadius: "25px",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  backgroundColor: getStatusColor(order.status) + "20",
                  color: getStatusColor(order.status),
                  marginBottom: "1rem",
                  textAlign: "center",
                }}
              >
                {getStatusText(order.status)}
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  className="member-btn"
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "8px",
                    fontSize: "0.8rem",
                  }}
                >
                  Chi tiết
                </button>
                {order.status === "completed" && (
                  <button
                    className="member-btn"
                    style={{
                      padding: "0.5rem 1rem",
                      borderRadius: "8px",
                      fontSize: "0.8rem",
                    }}
                  >
                    Đánh giá
                  </button>
                )}
              </div>
            </div>
          </div>
        ))
        )}
      </div>
    </div>
  );
};

export default OrdersTab;
