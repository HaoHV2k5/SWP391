import { Plus, Edit, Trash2, Eye, Check, X } from "lucide-react";
import { useState, useEffect } from "react";
import productService from "../../services/productService";

const ProductsTab = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Debug selectedProduct changes
  useEffect(() => {
    if (selectedProduct) {
      console.log("🎯 selectedProduct updated:", selectedProduct);
    }
  }, [selectedProduct]);

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await productService.getStaffApprovedProducts();
      if (result.success) {
        setProducts(result.data);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError("Không thể tải danh sách sản phẩm");
      console.error("Error fetching products:", error);
    }
    setLoading(false);
  };

  const handleViewProduct = async (productId) => {
    try {
      console.log("🔍 Fetching product detail for ID:", productId);
      const result = await productService.getProductById(productId);
      console.log("📦 Product detail result:", result);

      if (result.success) {
        console.log("✅ Product data:", result.data);
        setSelectedProduct(result.data);
        setShowModal(true);
      } else {
        console.error("❌ Failed to fetch product:", result.message);
        alert(result.message);
      }
    } catch (error) {
      console.error("❌ Error fetching product detail:", error);
      alert("Không thể tải chi tiết sản phẩm");
    }
  };

  const handleApprove = async (productId) => {
    if (!confirm("Bạn có chắc chắn muốn duyệt sản phẩm này?")) return;

    setActionLoading(true);
    try {
      const result = await productService.approveProductByAdmin(productId);
      if (result.success) {
        alert(result.message);
        fetchProducts(); // Refresh list
      } else {
        alert(result.message);
      }
    } catch (error) {
      alert("Không thể duyệt sản phẩm");
      console.error("Error approving product:", error);
    }
    setActionLoading(false);
  };

  const handleReject = async (productId) => {
    if (!rejectReason.trim()) {
      alert("Vui lòng nhập lý do từ chối");
      return;
    }

    setActionLoading(true);
    try {
      const result = await productService.rejectProductByAdmin(
        productId,
        rejectReason
      );
      if (result.success) {
        alert(result.message);
        setShowRejectModal(false);
        setRejectReason("");
        fetchProducts(); // Refresh list
      } else {
        alert(result.message);
      }
    } catch (error) {
      alert("Không thể từ chối sản phẩm");
      console.error("Error rejecting product:", error);
    }
    setActionLoading(false);
  };
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "#ffc107";
      case "STAFF_APPROVED":
        return "#17a2b8";
      case "ADMIN_APPROVED":
        return "#28a745";
      case "ACTIVE":
        return "#28a745";
      case "REJECTED":
        return "#dc3545";
      case "SOLD":
        return "#6c757d";
      case "INACTIVE":
        return "#dc3545";
      default:
        return "#6c757d";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "PENDING":
        return "Chờ Admin duyệt";
      case "STAFF_APPROVED":
        return "Staff đã duyệt";
      case "ADMIN_APPROVED":
        return "Admin đã duyệt";
      case "ACTIVE":
        return "Hoạt động";
      case "REJECTED":
        return "Bị từ chối";
      case "SOLD":
        return "Đã bán";
      case "INACTIVE":
        return "Không hoạt động";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <div>Đang tải danh sách sản phẩm...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div style={{ textAlign: "center", padding: "2rem", color: "#dc3545" }}>
          <div>Lỗi: {error}</div>
          <button
            className="btn btn-primary"
            onClick={fetchProducts}
            style={{ marginTop: "1rem" }}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "rgba(26, 26, 46, 0.8)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "15px",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
        padding: "2rem",
        color: "white",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <h3>
          Danh sách sản phẩm đã được Staff duyệt - Chờ Admin duyệt (
          {products.length})
        </h3>
        <button className="btn btn-primary" onClick={fetchProducts}>
          <Plus size={16} className="mr-1" />
          Làm mới
        </button>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e9ecef" }}>
              <th style={{ padding: "1rem", textAlign: "left" }}>ID</th>
              <th style={{ padding: "1rem", textAlign: "left" }}>Hình ảnh</th>
              <th style={{ padding: "1rem", textAlign: "left" }}>
                Tên sản phẩm
              </th>
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
                <td
                  colSpan="8"
                  style={{ padding: "2rem", textAlign: "center" }}
                >
                  Không có sản phẩm nào đã được Staff duyệt
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr
                  key={product.id}
                  style={{ borderBottom: "1px solid #e9ecef" }}
                >
                  <td style={{ padding: "1rem" }}>#{product.id}</td>
                  <td style={{ padding: "1rem" }}>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: "0.5rem" }}
                      onClick={() => handleViewProduct(product.id)}
                      title="Xem chi tiết"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <div
                      style={{
                        maxWidth: "200px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {product.title || product.name || "Không có tên"}
                    </div>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    {formatCurrency(product.price || 0)}
                  </td>
                  <td style={{ padding: "1rem" }}>
                    {product.productType || product.category || "N/A"}
                  </td>
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
                  <td style={{ padding: "1rem" }}>
                    {product.createdAt
                      ? new Date(product.createdAt).toLocaleDateString("vi-VN")
                      : "N/A"}
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        className="btn btn-success"
                        style={{ padding: "0.5rem" }}
                        onClick={() => handleApprove(product.id)}
                        disabled={actionLoading}
                        title="Duyệt sản phẩm"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        className="btn btn-danger"
                        style={{ padding: "0.5rem" }}
                        onClick={() => setShowRejectModal(true)}
                        disabled={actionLoading}
                        title="Từ chối sản phẩm"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal xem chi tiết sản phẩm */}
      {showModal && selectedProduct && (
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
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              backgroundColor: "#f8f9fa",
              borderRadius: "8px",
              padding: "2rem",
              maxWidth: "600px",
              width: "90%",
              maxHeight: "80vh",
              overflowY: "auto",
              border: "2px solid #dee2e6",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <h3>Chi tiết sản phẩm</h3>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                backgroundColor: "#ffffff",
                padding: "1rem",
                borderRadius: "8px",
                border: "1px solid #dee2e6",
              }}
            >
              <div>
                <h4 style={{ color: "#333", marginBottom: "1rem" }}>
                  Thông tin cơ bản
                </h4>
                <p style={{ color: "#333", marginBottom: "0.5rem" }}>
                  <strong style={{ color: "#333" }}>ID:</strong>{" "}
                  <span style={{ color: "#333" }}>
                    #{selectedProduct.id || "N/A"}
                  </span>
                </p>
                <p style={{ color: "#333", marginBottom: "0.5rem" }}>
                  <strong style={{ color: "#333" }}>Tên:</strong>{" "}
                  <span style={{ color: "#333" }}>
                    {selectedProduct.title ||
                      selectedProduct.name ||
                      "Không có tên"}
                  </span>
                </p>
                <p style={{ color: "#333", marginBottom: "0.5rem" }}>
                  <strong style={{ color: "#333" }}>Giá:</strong>{" "}
                  <span style={{ color: "#333" }}>
                    {formatCurrency(selectedProduct.price || 0)}
                  </span>
                </p>
                <p style={{ color: "#333", marginBottom: "0.5rem" }}>
                  <strong style={{ color: "#333" }}>Loại:</strong>{" "}
                  <span style={{ color: "#333" }}>
                    {selectedProduct.productType || "N/A"}
                  </span>
                </p>
                <p style={{ color: "#333", marginBottom: "0.5rem" }}>
                  <strong style={{ color: "#333" }}>Trạng thái:</strong>
                  <span
                    style={{
                      padding: "0.25rem 0.5rem",
                      borderRadius: "10px",
                      fontSize: "0.8rem",
                      backgroundColor: "#17a2b8",
                      color: "white",
                      marginLeft: "0.5rem",
                      fontWeight: "bold",
                    }}
                  >
                    {getStatusText(selectedProduct.status)}
                  </span>
                </p>
                <p style={{ color: "#333", marginBottom: "0.5rem" }}>
                  <strong style={{ color: "#333" }}>Mô tả:</strong>{" "}
                  <span style={{ color: "#333" }}>
                    {selectedProduct.description || "Không có mô tả"}
                  </span>
                </p>
              </div>

              <div>
                <h4 style={{ color: "#333", marginBottom: "1rem" }}>
                  Hình ảnh
                </h4>
                <div
                  style={{
                    marginBottom: "0.5rem",
                    fontSize: "12px",
                    color: "#666",
                  }}
                >
                  <strong>Debug imageUrls:</strong>{" "}
                  {JSON.stringify(selectedProduct.imageUrls)}
                </div>
                {(() => {
                  // Filter out invalid URLs (like "string", empty strings, etc.)
                  const validImages =
                    selectedProduct.imageUrls?.filter(
                      (img) =>
                        img &&
                        img !== "string" &&
                        img.startsWith("http") &&
                        img.length > 10
                    ) || [];

                  console.log("🖼️ Image processing:", {
                    original: selectedProduct.imageUrls,
                    validImages: validImages,
                  });

                  return validImages.length > 0 ? (
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "0.5rem",
                      }}
                    >
                      {validImages.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Hình ${index + 1}`}
                          style={{
                            width: "100px",
                            height: "100px",
                            objectFit: "cover",
                            borderRadius: "4px",
                            border: "1px solid #ddd",
                          }}
                          onError={(e) => {
                            console.error("❌ Lỗi load hình ảnh:", image);
                            e.target.style.display = "none";
                          }}
                          onLoad={() => {
                            console.log("✅ Load hình ảnh thành công:", image);
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div>
                      <p style={{ color: "#333" }}>Không có hình ảnh hợp lệ</p>
                      <p style={{ color: "#666", fontSize: "12px" }}>
                        Có thể do: API trả về dữ liệu test ("string") thay vì
                        URL thực tế
                      </p>
                    </div>
                  );
                })()}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: "1rem",
                marginTop: "2rem",
                justifyContent: "flex-end",
                backgroundColor: "#ffffff",
                padding: "1rem",
                borderRadius: "8px",
                border: "1px solid #dee2e6",
              }}
            >
              <button
                onClick={() => {
                  setShowModal(false);
                  handleApprove(selectedProduct.id);
                }}
                disabled={actionLoading}
                style={{
                  backgroundColor: "#28a745",
                  color: "#ffffff",
                  border: "2px solid #1e7e34",
                  padding: "0.75rem 1.5rem",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <Check size={16} />
                <span style={{ color: "#ffffff" }}>Duyệt</span>
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setShowRejectModal(true);
                }}
                disabled={actionLoading}
                style={{
                  backgroundColor: "#dc3545",
                  color: "#ffffff",
                  border: "2px solid #bd2130",
                  padding: "0.75rem 1.5rem",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <X size={16} />
                <span style={{ color: "#ffffff" }}>Từ chối</span>
              </button>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  backgroundColor: "#6c757d",
                  color: "#ffffff",
                  border: "2px solid #545b62",
                  padding: "0.75rem 1.5rem",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "bold",
                }}
              >
                <span style={{ color: "#ffffff" }}>Đóng</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal từ chối sản phẩm */}
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
          onClick={() => setShowRejectModal(false)}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "2rem",
              maxWidth: "400px",
              width: "90%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: "1rem" }}>Từ chối sản phẩm</h3>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>
                Lý do từ chối:
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Nhập lý do từ chối sản phẩm..."
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  minHeight: "100px",
                  resize: "vertical",
                }}
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
                className="btn btn-secondary"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                }}
              >
                Hủy
              </button>
              <button
                className="btn btn-danger"
                onClick={() => {
                  if (selectedProduct) {
                    handleReject(selectedProduct.id);
                  }
                }}
                disabled={actionLoading || !rejectReason.trim()}
              >
                {actionLoading ? "Đang xử lý..." : "Từ chối"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsTab;
