import { Eye, Check, X, Clock } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

const ProductsTab = ({
  products,
  setProducts,
  formatCurrency,
  getStatusColor,
  getStatusText,
  loading,
  setLoading,
}) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // Hàm duyệt sản phẩm
  const handleApproveProduct = async (productId) => {
    setLoading(true);
    try {
      // Gọi API duyệt sản phẩm
      // await fetch(`http://localhost:3979/products/${productId}/approve/staff`, {
      //   method: 'POST',
      //   headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      // });

      // Cập nhật state (mock)
      setProducts(
        products.map((p) =>
          p.id === productId ? { ...p, status: "STAFF_APPROVED" } : p
        )
      );
      toast.success("Duyệt tin đăng thành công!");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi duyệt tin đăng");
    } finally {
      setLoading(false);
    }
  };

  // Hàm từ chối sản phẩm
  const handleRejectProduct = async (productId, reason) => {
    setLoading(true);
    try {
      // Gọi API từ chối sản phẩm
      // await fetch(`http://localhost:3979/products/${productId}/reject`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({ reason })
      // });

      // Cập nhật state (mock)
      setProducts(
        products.map((p) =>
          p.id === productId ? { ...p, status: "REJECTED", reason } : p
        )
      );
      toast.success("Từ chối tin đăng thành công!");
      setShowRejectModal(false);
      setRejectReason("");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi từ chối tin đăng");
    } finally {
      setLoading(false);
    }
  };

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
        <h3>Tin Đăng chờ phê duyệt</h3>
        <div style={{ display: "flex", gap: "1rem" }}>
          <span style={{ color: "#666", fontSize: "0.9rem" }}>
            Tổng: {products.length} Tin Đăng
          </span>
        </div>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e9ecef" }}>
              <th style={{ padding: "1rem", textAlign: "left" }}>ID</th>
              <th style={{ padding: "1rem", textAlign: "left" }}>
                Tên Tin Đăng
              </th>
              <th style={{ padding: "1rem", textAlign: "left" }}>Người bán</th>
              <th style={{ padding: "1rem", textAlign: "left" }}>Giá</th>
              <th style={{ padding: "1rem", textAlign: "left" }}>Danh mục</th>
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
                <td style={{ padding: "1rem", maxWidth: "200px" }}>
                  <div>
                    <div style={{ fontWeight: "500", marginBottom: "0.25rem" }}>
                      {product.title}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "#666" }}>
                      {product.description}
                    </div>
                  </div>
                </td>
                <td style={{ padding: "1rem" }}>{product.seller}</td>
                <td style={{ padding: "1rem" }}>
                  {formatCurrency(product.price)}
                </td>
                <td style={{ padding: "1rem" }}>{product.category}</td>
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
                      className="staff-btn staff-btn-secondary"
                      style={{ padding: "0.25rem 0.5rem" }}
                      onClick={() => setSelectedProduct(product)}
                    >
                      <Eye size={14} />
                    </button>
                    {product.status === "PENDING" && (
                      <>
                        <button
                          className="staff-btn staff-btn-success"
                          style={{ padding: "0.25rem 0.5rem" }}
                          onClick={() => handleApproveProduct(product.id)}
                          disabled={loading}
                        >
                          <Check size={14} />
                        </button>
                        <button
                          className="staff-btn staff-btn-danger"
                          style={{ padding: "0.25rem 0.5rem" }}
                          onClick={() => setShowRejectModal(true)}
                          disabled={loading}
                        >
                          <X size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal xem chi tiết tin đăng */}
      {selectedProduct && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "darkslateblue",
              padding: "2rem",
              borderRadius: "8px",
              maxWidth: "600px",
              width: "90%",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
          >
            <h3 style={{ marginBottom: "1rem" }}>Chi tiết Tin Đăng</h3>
            <div style={{ marginBottom: "1rem" }}>
              <strong>Tên:</strong> {selectedProduct.title}
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <strong>Người bán:</strong> {selectedProduct.seller}
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <strong>Giá:</strong> {formatCurrency(selectedProduct.price)}
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <strong>Danh mục:</strong> {selectedProduct.category}
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <strong>Mô tả:</strong> {selectedProduct.description}
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <strong>Trạng thái:</strong>
              <span
                style={{
                  padding: "0.25rem 0.75rem",
                  borderRadius: "15px",
                  fontSize: "0.8rem",
                  backgroundColor:
                    getStatusColor(selectedProduct.status) + "20",
                  color: getStatusColor(selectedProduct.status),
                  marginLeft: "0.5rem",
                }}
              >
                {getStatusText(selectedProduct.status)}
              </span>
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <strong>Ngày tạo:</strong> {selectedProduct.createdAt}
            </div>
            {selectedProduct.reason && (
              <div style={{ marginBottom: "1rem" }}>
                <strong>Lý do từ chối:</strong> {selectedProduct.reason}
              </div>
            )}
            <div
              style={{
                display: "flex",
                gap: "1rem",
                justifyContent: "flex-end",
              }}
            >
              <button
                className="staff-btn staff-btn-secondary"
                onClick={() => setSelectedProduct(null)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal từ chối tin đăng */}
      {showRejectModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "rosybrown",
              padding: "2rem",
              borderRadius: "8px",
              maxWidth: "400px",
              width: "90%",
            }}
          >
            <h3 style={{ marginBottom: "1rem" }}>Từ chối tin đăng</h3>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>
                Lý do từ chối:
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  minHeight: "100px",
                }}
                placeholder="Nhập lý do từ chối tin đăng..."
              />
            </div>
            <div
              style={{
                display: "flex",
                gap: "1rem",
                justifyContent: "flex-end",
              }}
            >
              <button
                className="staff-btn staff-btn-secondary"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                }}
              >
                Hủy
              </button>
              <button
                className="staff-btn staff-btn-danger"
                onClick={() => {
                  if (rejectReason.trim()) {
                    handleRejectProduct(selectedProduct?.id || 1, rejectReason);
                  } else {
                    toast.error("Vui lòng nhập lý do từ chối");
                  }
                }}
                disabled={loading}
              >
                Từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsTab;
