import { Eye, Edit, UserCheck } from "lucide-react";

const CustomersTab = ({ customers, getStatusColor, getStatusText }) => {
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
        <h3>Danh sách khách hàng</h3>
        <button className="staff-btn staff-btn-primary">
          <UserCheck size={16} />
          Thêm khách hàng
        </button>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e9ecef" }}>
              <th style={{ padding: "1rem", textAlign: "left" }}>ID</th>
              <th style={{ padding: "1rem", textAlign: "left" }}>Tên</th>
              <th style={{ padding: "1rem", textAlign: "left" }}>Email</th>
              <th style={{ padding: "1rem", textAlign: "left" }}>Số điện thoại</th>
              <th style={{ padding: "1rem", textAlign: "left" }}>Trạng thái</th>
              <th style={{ padding: "1rem", textAlign: "left" }}>Tổng đơn hàng</th>
              <th style={{ padding: "1rem", textAlign: "left" }}>Ngày tham gia</th>
              <th style={{ padding: "1rem", textAlign: "left" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id} style={{ borderBottom: "1px solid #e9ecef" }}>
                <td style={{ padding: "1rem" }}>#{customer.id}</td>
                <td style={{ padding: "1rem" }}>{customer.name}</td>
                <td style={{ padding: "1rem" }}>{customer.email}</td>
                <td style={{ padding: "1rem" }}>{customer.phone}</td>
                <td style={{ padding: "1rem" }}>
                  <span
                    style={{
                      padding: "0.25rem 0.75rem",
                      borderRadius: "15px",
                      fontSize: "0.8rem",
                      backgroundColor: getStatusColor(customer.status) + "20",
                      color: getStatusColor(customer.status),
                    }}
                  >
                    {getStatusText(customer.status)}
                  </span>
                </td>
                <td style={{ padding: "1rem" }}>{customer.totalOrders}</td>
                <td style={{ padding: "1rem" }}>{customer.joinDate}</td>
                <td style={{ padding: "1rem" }}>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button className="staff-action-btn" title="Xem chi tiết">
                      <Eye size={16} />
                    </button>
                    <button className="staff-action-btn" title="Chỉnh sửa">
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

export default CustomersTab;



