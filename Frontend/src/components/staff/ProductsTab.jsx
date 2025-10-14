import { Eye, Check, X, RefreshCw } from "lucide-react";
import { useState } from "react";

// Import custom hooks and components
import { useProducts } from "../../hooks/useStaff";
import { LoadingSpinner, ActionButtons, RefreshButton, Modal } from "./common/StaffComponents";
import { showErrorNotification } from "../../utils/notificationManager";

const ProductsTab = ({
  products: externalProducts,
  setProducts: externalSetProducts,
  formatCurrency,
  getStatusColor,
  getStatusText,
  loading: externalLoading,
  setLoading: externalSetLoading,
}) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // Use custom hook for products management
  const productsHook = useProducts();

  // Use external props if provided, otherwise use hook data
  const products = externalProducts || productsHook.products;
  const setProducts = externalSetProducts || productsHook.setProducts;
  const loading = externalLoading || productsHook.loading;
  const isInitialLoading = productsHook.isInitialLoading;
  const handleRefresh = productsHook.loadProducts;
  const handleApproveProduct = productsHook.approveProduct;
  const handleRejectProduct = productsHook.rejectProduct;

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
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <RefreshButton 
            onRefresh={handleRefresh}
            loading={loading || isInitialLoading}
          />
          <span style={{ color: "#666", fontSize: "0.9rem" }}>
            Tổng: {products.length} Tin Đăng
          </span>
        </div>
      </div>

      {/* Loading state */}
      {isInitialLoading && (
        <LoadingSpinner text="Đang tải dữ liệu tin đăng..." />
      )}

      {/* Table */}
      {!isInitialLoading && (
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
              {products.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ padding: "2rem", textAlign: "center", color: "#666" }}>
                    Chưa có dữ liệu tin đăng
                  </td>
                </tr>
              ) : (
                products.map((product) => (
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
                      <ActionButtons
                        onView={() => setSelectedProduct(product)}
                        onApprove={() => handleApproveProduct(product.id)}
                        onReject={() => {
                          setSelectedProduct(product);
                          setShowRejectModal(true);
                        }}
                        status={product.status}
                        loading={loading}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal xem chi tiết tin đăng */}
      <Modal
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        title="Chi tiết Tin Đăng"
        width="large"
      >
        {selectedProduct && (
          <div>
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
          </div>
        )}
      </Modal>

      {/* Modal từ chối tin đăng */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectReason("");
        }}
        title="Từ chối tin đăng"
        width="small"
      >
        <div>
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
                  showErrorNotification("Vui lòng nhập lý do từ chối");
                }
              }}
              disabled={loading}
            >
              Từ chối
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProductsTab;
