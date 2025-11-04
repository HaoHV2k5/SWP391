import { Container, Spinner, Alert } from "react-bootstrap";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useProductDetailLogic } from "../../hooks/useProductDetail";
import wishlistService from "../../services/wishlistService";
import BuyButton from "../../components/order/BuyButton";
import ReviewSummary from "../../components/review/ReviewSummary";
import ReviewForm from "../../components/review/ReviewForm";
import "../../components/homepageContainer/styles/ProductDetail.css";

const ProductDetailPage = ({ user }) => {
  const {
    data,
    loading,
    error,
    images,
    mainImage,
    currentImageIndex,
    productInfo,
    sellerInfo,
    formatPrice,
    formatDate,
    nextImage,
    prevImage,
    setCurrentImageIndex
  } = useProductDetailLogic();
  
  const [state, setState] = useState({
    savedProducts: [],
    loading: false,
    currentUserId: null,
    initialized: false
  });

  // Subscribe to wishlistService state changes
  useEffect(() => {
    // Get initial state
    const initialState = wishlistService.getCurrentState();
    setState(initialState);

    // Subscribe to state changes
    const unsubscribe = wishlistService.subscribe((newState) => {
      setState(newState);
    });

    return unsubscribe;
  }, []);

  const saved = data?.id ? wishlistService.isSaved(data.id) : false;
  
  const handleSaveClick = async () => {
    if (data) {
      try {
        const wasSaved = wishlistService.isSaved(data.id);
        
        if (wasSaved) {
          // Nếu đã lưu rồi thì bỏ lưu
          await wishlistService.remove(data.id);
          toast.success("Đã bỏ lưu tin đăng!");
        } else {
          // Nếu chưa lưu thì lưu và hiển thị thông báo
          try {
            await wishlistService.add(data);
            toast.success("Tin đã được lưu vào danh sách theo dõi");
          } catch (addError) {
            console.error("Error adding to wishlist:", addError);
            toast.error("Có lỗi xảy ra khi lưu tin đăng");
          }
        }
      } catch (error) {
        console.error("Error toggling wishlist:", error);
        toast.error("Có lỗi xảy ra khi lưu tin đăng");
      }
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="success" className="mb-3" />
        <div className="text-muted">Đang tải chi tiết sản phẩm…</div>
      </Container>
    );
  }

  if (error || !data) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error || "Không tìm thấy sản phẩm"}</Alert>
      </Container>
    );
  }

  return (
    <div className="product-detail-container">
      <Container className="py-4">
        {/* Dynamic Breadcrumb based on backend data */}
        <nav aria-label="breadcrumb" className="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><a href="/">Electric Store</a></li>
            <li className="breadcrumb-item">
              <a href={(() => {
                // Map productType từ backend sang URL slug
                const typeMapping = {
                  'VEHICLE': 'electric-scooter',  // VEHICLE dẫn đến xe máy điện
                  'BATTERY': 'battery'
                };
                const urlSlug = typeMapping[data.productType] || 'battery';
                return `/products/${urlSlug}`;
              })()}>
                {data.productType === 'VEHICLE' ? 'Xe điện' : 
                 data.productType === 'BATTERY' ? 'Pin' : 
                 'Sản phẩm'}
              </a>
            </li>
            <li className="breadcrumb-item active" aria-current="page">{data.title}</li>
          </ol>
        </nav>

        {/* Single Card Container */}
        <div className="product-card-container">
          <div className="row g-0">
            {/* Hình ảnh - Cột trái */}
            <div className="col-md-5">
              <div className="image-gallery">
                {/* Hình ảnh chính */}
                <div className="main-image-container">
                  <img 
                    src={mainImage} 
                    alt={data.title} 
                    className="main-image"
                    onError={(e) => {
                      e.currentTarget.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5OTkiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPi";
                    }}
                  />
                  
                  {/* Navigation arrows */}
                  {images.length > 1 && (
                    <>
                      <button 
                        className="nav-arrow left"
                        onClick={prevImage}
                      >
                        <i className="bi bi-chevron-left"></i>
                      </button>
                      <button 
                        className="nav-arrow right"
                        onClick={nextImage}
                      >
                        <i className="bi bi-chevron-right"></i>
                      </button>
                    </>
                  )}

                  {/* Image counter */}
                  {images.length > 1 && (
                    <div className="image-counter">
                      <small>{currentImageIndex + 1}/{images.length}</small>
                    </div>
                  )}
                </div>
                
                {/* Thư viện hình ảnh thumbnails */}
                {images.length > 1 && (
                  <div className="thumbnail-gallery">
                    {images.slice(0, 6).map((url, index) => (
                      <img
                        key={index}
                        src={url}
                        alt={`${data.title} ${index + 1}`}
                        className={`thumbnail ${currentImageIndex === index ? 'active' : ''}`}
                        onClick={() => setCurrentImageIndex(index)}
                        onError={(e) => {
                          e.currentTarget.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5OTkiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPi";
                        }}
                      />
                    ))}
                    {images.length > 6 && (
                      <div className="thumbnail-more">
                        <i className="bi bi-chevron-right"></i>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Thông tin sản phẩm - Cột phải */}
            <div className="col-md-7">
              <div className="product-info-card">
                {/* Tiêu đề và nút Lưu */}
                <div className="d-flex justify-content-between align-items-start mb-4">
                  <div style={{ flex: 1 }}>
                    <h1 className="product-title">
                      {data.title}
                    </h1>
                    {/* Approved Badge - Hiển thị khi có approvedLabel */}
                    {data.approvedLabel && (
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          marginTop: "12px",
                          background: "#f0fdf4",
                          color: "#16a34a",
                          padding: "8px 14px",
                          borderRadius: "8px",
                          fontSize: "13px",
                          fontWeight: "600",
                          border: "1px solid #bbf7d0",
                        }}
                        title="Đã được kiểm duyệt"
                      >
                        <i className="bi bi-patch-check-fill" style={{ fontSize: "15px" }}></i>
                        <span>Đã kiểm duyệt</span>
                      </div>
                    )}
                  </div>
                  <button 
                    className={`btn btn-heart ${saved ? 'btn-heart-active' : ''}`}
                    onClick={handleSaveClick}
                    disabled={!data}
                    title={saved ? 'Đã lưu' : 'Lưu sản phẩm'}
                  >
                    <i className={`bi ${saved ? 'bi-heart-fill' : 'bi-heart'}`}></i>
                  </button>
                </div>

                {/* Giá */}
                <div className="product-price-section mb-4">
                  <div className="product-price">
                    {formatPrice(data.price)}
                  </div>
                </div>

                {/* Thời gian đăng */}
                <div className="update-info mb-4">
                  <i className="bi bi-clock-fill"></i>
                  <span>Đăng ngày {formatDate(data.createdAt)}</span>
                </div>

                {/* Thông tin người bán */}
                <div className="seller-info-section mb-4">
                  <div className="seller-header">
                    <div className="seller-avatar">
                      <i className="bi bi-person-fill"></i>
                    </div>
                    <div className="seller-details">
                      <h6 className="seller-name">{sellerInfo.name}</h6>
                      <div className="seller-meta">
                        <i className="bi bi-shop"></i>
                        <span>Người bán</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Nút mua hàng */}
                <div className="action-buttons">
                  <BuyButton 
                    product={data} 
                    user={user}
                    onOrderSuccess={(orderData) => {
                      console.log("Order created successfully:", orderData);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Section - Below main card */}
        <div className="product-details-section">
          <div className="row">
            <div className="col-md-9">
              {/* Mô tả chi tiết - Separate card */}
              <div className="description-card">
                <div className="card-header-custom">
                  <h6 className="card-title mb-0">
                    <i className="bi bi-file-text me-2"></i>
                    Mô tả chi tiết
                  </h6>
                </div>
                <div className="card-content">
                  {data.description ? (
                    <div className="product-description">
                      <p>{data.description}</p>
                    </div>
                  ) : (
                    <div className="no-content">
                      <i className="bi bi-file-text"></i>
                      <p>Chưa có mô tả chi tiết</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Thông tin chi tiết - Separate card với phân loại */}
              <div className={`specs-card ${data.productType === 'VEHICLE' ? 'vehicle-card' : 'battery-card'}`}>
                <div className="card-header-custom">
                  <h6 className="card-title mb-0">
                    <i className="bi bi-info-circle me-2"></i>
                    Thông tin chi tiết
                  </h6>
                </div>
                <div className="card-content">
                  {productInfo.details.length > 0 ? (
                    <div className="product-specs">
                      <div className="specs-list">
                        {productInfo.details.map((detail, index) => (
                          <div key={index} className="spec-item">
                            <div className="spec-label">
                              <i className={`bi ${data.productType === 'VEHICLE' ? 'bi-check-circle-fill' : 'bi-check-circle-fill'} me-2`}></i>
                              {detail.label}
                            </div>
                            <div className="spec-value">{detail.value || 'Chưa cập nhật'}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="no-content">
                      <i className="bi bi-inbox"></i>
                      <p>Chưa có thông tin chi tiết</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Reviews Section */}
            <div className="col-md-3">
              <div className="mb-3">
                <ReviewSummary 
                  sellerId={data?.sellerId}
                  productId={data?.id}
                />
              </div>
              <ReviewForm 
                user={user}
                sellerId={data?.sellerId}
                onSuccess={() => {
                  // Có thể reload page hoặc show message
                  window.location.reload();
                }}
              />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default ProductDetailPage;
