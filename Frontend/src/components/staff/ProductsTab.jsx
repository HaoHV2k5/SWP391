import { Plus, Eye, Edit } from "lucide-react";

const ProductsTab = ({ formatCurrency }) => {
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
        <h3>Danh sách sản phẩm</h3>
        <button className="staff-btn staff-btn-primary">
          <Plus size={16} />
          Thêm sản phẩm
        </button>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e9ecef" }}>
              <th style={{ padding: "1rem", textAlign: "left" }}>ID</th>
              <th style={{ padding: "1rem", textAlign: "left" }}>Tên sản phẩm</th>
              <th style={{ padding: "1rem", textAlign: "left" }}>Giá</th>
              <th style={{ padding: "1rem", textAlign: "left" }}>Danh mục</th>
              <th style={{ padding: "1rem", textAlign: "left" }}>Tồn kho</th>
              <th style={{ padding: "1rem", textAlign: "left" }}>Trạng thái</th>
              <th style={{ padding: "1rem", textAlign: "left" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: "1px solid #e9ecef" }}>
              <td style={{ padding: "1rem" }}>#1</td>
              <td style={{ padding: "1rem" }}>Pin Lithium-ion 48V 20Ah</td>
              <td style={{ padding: "1rem" }}>{formatCurrency(2500000)}</td>
              <td style={{ padding: "1rem" }}>Pin</td>
              <td style={{ padding: "1rem" }}>15</td>
              <td style={{ padding: "1rem" }}>
                <span
                  style={{
                    padding: "0.25rem 0.75rem",
                    borderRadius: "15px",
                    fontSize: "0.8rem",
                    backgroundColor: "#28a74520",
                    color: "#28a745",
                  }}
                >
                  Hoạt động
                </span>
              </td>
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
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductsTab;



