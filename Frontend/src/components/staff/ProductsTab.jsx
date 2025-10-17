import { Eye, Check, X, RefreshCw } from "lucide-react";
import { useState } from "react";

// Import custom hooks and components
import { useProducts } from "../../hooks/useStaff";
import { LoadingSpinner, ActionButtons, RefreshButton, Modal } from "./common/StaffComponents";
import { showErrorNotification } from "../../utils/notificationManager";
import { formatDate } from "../../utils/staffUtils";

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
            Tổng: {products.length} Tin Đăng chờ duyệt
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
                products.map((product, index) => {
                  console.log(`🔍 Rendering product ${index + 1}:`, product);
                  return (
                    <tr
                      key={product.id}
                      style={{ borderBottom: "1px solid #e9ecef" }}
                    >
                    <td style={{ padding: "1rem" }}>#{product.id}</td>
                    <td style={{ padding: "1rem", maxWidth: "200px" }}>
                      <div>
                        <div style={{ fontWeight: "500", marginBottom: "0.25rem" }}>
                          {product.title || product.name || product.productName || "N/A"}
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "#666" }}>
                          {product.description || product.desc || "N/A"}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      {product.seller || product.sellerName || product.user?.fullName || product.user?.name || "N/A"}
                    </td>
                    <td style={{ padding: "1rem" }}>
                      {formatCurrency(product.price || product.priceValue || 0)}
                    </td>
                    <td style={{ padding: "1rem" }}>
                      {product.category || product.categoryName || product.catName || "N/A"}
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
                      {formatDate(product.createdAt || product.created_at || product.createDate)}
                    </td>
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal xem chi tiết tin đăng */}
      <Modal
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        title=""
        width="xlarge"
        showCloseButton={true}
      >
        {selectedProduct ? (
          <div style={{ 
            color: '#000', 
            fontSize: '16px', 
            lineHeight: '1.6',
            backgroundColor: '#fff',
            padding: '0',
            minHeight: '500px',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
          }}>
            {/* Header với gradient và thông tin cơ bản */}
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '2.5rem',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Background Pattern */}
              <div style={{
                position: 'absolute',
                top: '-50%',
                right: '-20%',
                width: '200px',
                height: '200px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '50%',
                opacity: 0.3
              }}></div>
              <div style={{
                position: 'absolute',
                bottom: '-30%',
                left: '-10%',
                width: '150px',
                height: '150px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '50%',
                opacity: 0.2
              }}></div>
              
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'linear-gradient(45deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '32px',
                    fontWeight: 'bold',
                    border: '3px solid rgba(255,255,255,0.3)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
                  }}>
                    {selectedProduct?.title?.charAt(0)?.toUpperCase() || 'P'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h1 style={{ 
                      color: 'white', 
                      margin: '0 0 0.5rem 0', 
                      fontSize: '28px',
                      fontWeight: '700',
                      textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}>
                      {selectedProduct?.title || selectedProduct?.name || selectedProduct?.productName || "N/A"}
                    </h1>
                    <div style={{ 
                      color: 'rgba(255,255,255,0.9)', 
                      fontSize: '16px',
                      marginBottom: '0.5rem'
                    }}>
                      <strong>ID:</strong> #{selectedProduct?.id}
                    </div>
                    <div style={{ 
                      color: 'rgba(255,255,255,0.8)', 
                      fontSize: '15px'
                    }}>
                      <strong>Người bán:</strong> {selectedProduct?.seller || selectedProduct?.sellerName || selectedProduct?.user?.fullName || selectedProduct?.user?.name || "N/A"}
                    </div>
                  </div>
                </div>
                
                {/* Status và thông tin phụ */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      padding: "0.75rem 1.5rem",
                      borderRadius: "25px",
                      fontSize: "14px",
                      fontWeight: "600",
                      backgroundColor: getStatusColor(selectedProduct?.status) + "30",
                      color: getStatusColor(selectedProduct?.status),
                      border: `2px solid ${getStatusColor(selectedProduct?.status)}50`,
                      boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    {getStatusText(selectedProduct?.status)}
                  </span>
                  <div style={{ 
                    color: 'rgba(255,255,255,0.8)', 
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <span>📅</span>
                    <span>{formatDate(selectedProduct?.createdAt || selectedProduct?.created_at || selectedProduct?.createDate)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div style={{ padding: '2.5rem' }}>
              {/* Price Card - Highlighted */}
              <div style={{ 
                marginBottom: "2.5rem", 
                padding: "2rem", 
                background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                borderRadius: "16px",
                textAlign: 'center',
                color: 'white',
                boxShadow: '0 10px 25px rgba(40, 167, 69, 0.3)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Background Pattern */}
                <div style={{
                  position: 'absolute',
                  top: '-20px',
                  right: '-20px',
                  width: '100px',
                  height: '100px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '50%',
                  opacity: 0.5
                }}></div>
                
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ fontSize: '16px', marginBottom: '0.75rem', opacity: 0.9 }}>💰 Giá sản phẩm</div>
                  <div style={{ 
                    fontSize: '36px', 
                    fontWeight: '800', 
                    marginBottom: '0.5rem',
                    textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}>
                    {formatCurrency(selectedProduct?.price || selectedProduct?.priceValue || 0)}
                  </div>
                  <div style={{ fontSize: '14px', opacity: 0.8 }}>Giá đã bao gồm thuế và phí</div>
                </div>
              </div>

              {/* Info Grid */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                gap: '1.5rem',
                marginBottom: '2.5rem'
              }}>
                {/* Category */}
                <div style={{ 
                  padding: "2rem", 
                  background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                  borderRadius: "16px",
                  border: "1px solid #90caf9",
                  boxShadow: '0 8px 16px rgba(33, 150, 243, 0.1)',
                  transition: 'transform 0.2s ease'
                }}>
                  <div style={{ 
                    fontSize: '14px', 
                    color: '#1976d2', 
                    marginBottom: '0.75rem', 
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    📂 Danh mục sản phẩm
                  </div>
                  <div style={{ 
                    fontSize: '18px', 
                    color: '#0d47a1', 
                    fontWeight: '700',
                    lineHeight: '1.4'
                  }}>
                    {selectedProduct?.category || selectedProduct?.categoryName || selectedProduct?.catName || "Chưa phân loại"}
                  </div>
                </div>

                {/* Seller */}
                <div style={{ 
                  padding: "2rem", 
                  background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
                  borderRadius: "16px",
                  border: "1px solid #ce93d8",
                  boxShadow: '0 8px 16px rgba(156, 39, 176, 0.1)',
                  transition: 'transform 0.2s ease'
                }}>
                  <div style={{ 
                    fontSize: '14px', 
                    color: '#7b1fa2', 
                    marginBottom: '0.75rem', 
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    👤 Thông tin người bán
                  </div>
                  <div style={{ 
                    fontSize: '18px', 
                    color: '#4a148c', 
                    fontWeight: '700',
                    lineHeight: '1.4'
                  }}>
                    {selectedProduct?.seller || selectedProduct?.sellerName || selectedProduct?.user?.fullName || selectedProduct?.user?.name || "N/A"}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div style={{ 
                marginBottom: "2.5rem", 
                padding: "2rem", 
                background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
                borderRadius: "16px",
                border: "1px solid #ffcc02",
                boxShadow: '0 8px 16px rgba(255, 152, 0, 0.1)'
              }}>
                <div style={{ 
                  fontSize: '16px', 
                  color: '#e65100', 
                  marginBottom: '1rem', 
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  📝 Mô tả chi tiết sản phẩm
                </div>
                <div style={{ 
                  fontSize: '16px', 
                  color: '#bf360c', 
                  lineHeight: "1.7",
                  minHeight: '80px',
                  whiteSpace: 'pre-wrap',
                  fontStyle: 'italic'
                }}>
                  {selectedProduct?.description || selectedProduct?.desc || "Chưa có mô tả chi tiết về sản phẩm này."}
                </div>
              </div>

              {/* Additional Info */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
                gap: '1.5rem',
                marginBottom: '2.5rem'
              }}>
                <div style={{ 
                  padding: "1.5rem", 
                  background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
                  borderRadius: "12px",
                  border: "1px solid #a5d6a7",
                  boxShadow: '0 4px 8px rgba(76, 175, 80, 0.1)'
                }}>
                  <div style={{ 
                    fontSize: '13px', 
                    color: '#2e7d32', 
                    marginBottom: '0.5rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>📅 Ngày đăng tin</div>
                  <div style={{ 
                    fontSize: '15px', 
                    color: '#1b5e20', 
                    fontWeight: '600'
                  }}>
                    {formatDate(selectedProduct?.createdAt || selectedProduct?.created_at || selectedProduct?.createDate)}
                  </div>
                </div>

                <div style={{ 
                  padding: "1.5rem", 
                  background: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd9 100%)',
                  borderRadius: "12px",
                  border: "1px solid #f48fb1",
                  boxShadow: '0 4px 8px rgba(233, 30, 99, 0.1)'
                }}>
                  <div style={{ 
                    fontSize: '13px', 
                    color: '#ad1457', 
                    marginBottom: '0.5rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>🆔 Mã sản phẩm</div>
                  <div style={{ 
                    fontSize: '15px', 
                    color: '#880e4f', 
                    fontWeight: '600'
                  }}>
                    #{selectedProduct?.id}
                  </div>
                </div>
              </div>

              {/* Rejection Reason (if exists) */}
              {selectedProduct?.reason && (
                <div style={{ 
                  marginBottom: "2.5rem", 
                  padding: "2rem", 
                  background: 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)',
                  borderRadius: "16px",
                  border: "2px solid #f44336",
                  boxShadow: '0 8px 16px rgba(244, 67, 54, 0.2)'
                }}>
                  <div style={{ 
                    fontSize: '16px', 
                    color: '#c62828', 
                    marginBottom: '1rem', 
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    ❌ Lý do từ chối tin đăng
                  </div>
                  <div style={{ 
                    fontSize: '16px', 
                    color: '#d32f2f', 
                    lineHeight: "1.6",
                    fontStyle: 'italic',
                    padding: '1rem',
                    backgroundColor: 'rgba(255,255,255,0.5)',
                    borderRadius: '8px',
                    border: '1px solid rgba(244, 67, 54, 0.3)'
                  }}>
                    {selectedProduct.reason}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ 
                display: 'flex', 
                gap: '1.5rem', 
                justifyContent: 'center',
                padding: '2rem',
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                borderRadius: '16px',
                border: '1px solid #dee2e6',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
              }}>
                <button
                  onClick={() => handleApproveProduct(selectedProduct?.id)}
                  disabled={loading || selectedProduct?.status !== 'PENDING'}
                  style={{
                    padding: '1rem 2.5rem',
                    background: selectedProduct?.status === 'PENDING' 
                      ? 'linear-gradient(135deg, #28a745 0%, #20c997 100%)' 
                      : 'linear-gradient(135deg, #6c757d 0%, #495057 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: selectedProduct?.status === 'PENDING' ? 'pointer' : 'not-allowed',
                    fontSize: '16px',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                    boxShadow: selectedProduct?.status === 'PENDING' 
                      ? '0 8px 16px rgba(40, 167, 69, 0.3)' 
                      : '0 4px 8px rgba(108, 117, 125, 0.2)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedProduct?.status === 'PENDING') {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 12px 20px rgba(40, 167, 69, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedProduct?.status === 'PENDING') {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 8px 16px rgba(40, 167, 69, 0.3)';
                    }
                  }}
                >
                  ✅ Duyệt tin đăng
                </button>
                
                <button
                  onClick={() => {
                    setShowRejectModal(true);
                  }}
                  disabled={loading || selectedProduct?.status !== 'PENDING'}
                  style={{
                    padding: '1rem 2.5rem',
                    background: selectedProduct?.status === 'PENDING' 
                      ? 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)' 
                      : 'linear-gradient(135deg, #6c757d 0%, #495057 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: selectedProduct?.status === 'PENDING' ? 'pointer' : 'not-allowed',
                    fontSize: '16px',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                    boxShadow: selectedProduct?.status === 'PENDING' 
                      ? '0 8px 16px rgba(220, 53, 69, 0.3)' 
                      : '0 4px 8px rgba(108, 117, 125, 0.2)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedProduct?.status === 'PENDING') {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 12px 20px rgba(220, 53, 69, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedProduct?.status === 'PENDING') {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 8px 16px rgba(220, 53, 69, 0.3)';
                    }
                  }}
                >
                  ❌ Từ chối
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ 
            color: '#000', 
            textAlign: 'center', 
            padding: '4rem 2rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '12px',
            border: '1px solid #e9ecef'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '1rem' }}>📋</div>
            <h3 style={{ fontSize: '20px', color: '#666', marginBottom: '0.5rem' }}>
              Không có dữ liệu để hiển thị
            </h3>
            <p style={{ fontSize: '16px', color: '#999' }}>
              Vui lòng chọn một tin đăng để xem chi tiết
            </p>
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
