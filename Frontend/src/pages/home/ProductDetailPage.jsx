import { Container, Spinner, Alert } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useProductDetailLogic } from "../../hooks/useProductDetail";
import wishlistService from "../../services/wishlistService";
import "../../components/homepageContainer/styles/ProductDetail.css";

const ProductDetailPage = () => {
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
        await wishlistService.toggle(data);
      } catch (error) {
        console.error("Error toggling wishlist:", error);
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

                  {/* Action buttons */}
                  <div className="image-actions">
                    <button className="image-action-btn">
                      <i className="bi bi-share"></i>
                    </button>
                    <button className="image-action-btn">
                      <i className="bi bi-three-dots"></i>
                    </button>
                  </div>
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
              <div className="d-flex justify-content-between align-items-start mb-3">
                <h2 className="product-title">
                  {data.title}
                </h2>
                <button 
                  className={`btn btn-sm ${saved ? 'btn-danger' : 'btn-outline-danger'}`}
                  onClick={handleSaveClick}
                  disabled={!data}
                >
                  <i className={`bi ${saved ? 'bi-heart-fill' : 'bi-heart'}`}></i>
                </button>
              </div>
              
              {/* Thông tin sản phẩm - Dynamic from backend */}
              <div className="product-subtitle">
                {data.productType === 'VEHICLE' ? 'Xe điện' : 
                 data.productType === 'BATTERY' ? 'Pin/Bộ sạc' : 
                 data.productType || 'Sản phẩm'}
                {productInfo.brand && ` • ${productInfo.brand}`}
                {productInfo.year && ` • ${productInfo.year}`}
              </div>

              {/* Giá */}
              <div className="product-price">
                {formatPrice(data.price)}
              </div>


              {/* Thời gian cập nhật */}
              <div className="update-info">
                <i className="bi bi-clock"></i>
                <span>Cập nhật {formatDate(data.createdAt)}</span>
              </div>

              {/* Thông tin người bán - Only backend data */}
              <div className="seller-info-section">
                <div className="seller-header">
                  <div className="seller-avatar bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" 
                       style={{ width: '50px', height: '50px' }}>
                    <i className="bi bi-person-fill fs-4"></i>
                  </div>
                  <div className="seller-details">
                    <h6 className="seller-name">{sellerInfo.name}</h6>
                    <div className="seller-meta">
                      <i className="bi bi-person"></i>
                      <span>Người bán</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Nút liên hệ */}
              <div className="action-buttons">
                <button className="chat-button">
                  <i className="bi bi-chat-dots me-2"></i>
                  Liên hệ người bán
                </button>
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
                <h6 className="card-title">Mô tả chi tiết</h6>
                <div className="card-content">
                  {data.description ? (
                    <div className="product-description">
                      <p>{data.description}</p>
                    </div>
                  ) : (
                    <div className="no-content">
                      <p>Chưa có mô tả chi tiết</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Thông tin chi tiết - Separate card */}
              <div className="specs-card">
                <h6 className="card-title">Thông tin chi tiết</h6>
                <div className="card-content">
                  {productInfo.details.length > 0 ? (
                    <div className="product-specs">
                      <div className="specs-list">
                        {productInfo.details.map((detail, index) => (
                          <div key={index} className="spec-item">
                            <div className="spec-label">{detail.label}</div>
                            <div className="spec-value">{detail.value || 'Không xác định'}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="no-content">
                      <p>Chưa có thông tin chi tiết</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Comments Section */}
            <div className="col-md-3">
              <div className="comments-section">
                <div className="comments-icon">
                  <i className="bi bi-chat-dots"></i>
                </div>
                <div className="comments-content">
                  <p className="no-comments-text">Chưa có bình luận nào. Hãy để lại bình luận cho người bán.</p>
                  <div className="comment-form">
                    <div className="input-group">
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Bình luận..." 
                      />
                      <button className="btn btn-outline-secondary" type="button">
                        <i className="bi bi-arrow-right"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default ProductDetailPage;
