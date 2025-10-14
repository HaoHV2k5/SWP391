import { Plus, Edit, Trash2 } from "lucide-react";

const ProductsTab = ({ products }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "#28a745";
      case "inactive":
        return "#dc3545";
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
      default:
        return status;
    }
  };

  return (
    <div className="card">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <h3>Danh sách sản phẩm</h3>
        <button className="btn btn-primary">
          <Plus size={16} className="mr-1" />
          Thêm sản phẩm
        </button>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e9ecef" }}>
              <th style={{ padding: "1rem", textAlign: "left" }}>ID</th>
              <th style={{ padding: "1rem", textAlign: "left" }}>
                Tên sản phẩm
              </th>
              <th style={{ padding: "1rem", textAlign: "left" }}>Giá</th>
              <th style={{ padding: "1rem", textAlign: "left" }}>Danh mục</th>
              <th style={{ padding: "1rem", textAlign: "left" }}>Tồn kho</th>
              <th style={{ padding: "1rem", textAlign: "left" }}>Trạng thái</th>
              <th style={{ padding: "1rem", textAlign: "left" }}>Ngày tạo</th>
              <th style={{ padding: "1rem", textAlign: "left" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={product.id}
                style={{ borderBottom: "1px solid #e9ecef" }}
              >
                <td style={{ padding: "1rem" }}>#{product.id}</td>
                <td style={{ padding: "1rem" }}>{product.name}</td>
                <td style={{ padding: "1rem" }}>
                  {formatCurrency(product.price)}
                </td>
                <td style={{ padding: "1rem" }}>{product.category}</td>
                <td style={{ padding: "1rem" }}>{product.stock}</td>
                <td style={{ padding: "1rem" }}>
                  <span
                    style={{
                      padding: "0.25rem 0.75rem",
                      borderRadius: "15px",
                      fontSize: "0.8rem",
                      backgroundColor: getStatusColor(product.status) + "20",
                      color: getStatusColor(product.status),
                    }}
                  >
                    {getStatusText(product.status)}
                  </span>
                </td>
                <td style={{ padding: "1rem" }}>{product.createdAt}</td>
                <td style={{ padding: "1rem" }}>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: "0.5rem" }}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="btn btn-secondary"
                      style={{
                        padding: "0.5rem",
                        backgroundColor: "#dc3545",
                      }}
                    >
                      <Trash2 size={16} />
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

export default ProductsTab;
