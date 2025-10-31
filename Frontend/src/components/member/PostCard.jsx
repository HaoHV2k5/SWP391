import { Dropdown } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../../styles/member/MyPosts.css";

const PostCard = ({ 
  post, 
  currentImageIndex, 
  hasMultipleImages, 
  postImages,
  postingProducts,
  onPrevImage,
  onNextImage,
  onEdit,
  onDelete,
  onPostProduct,
  getStatusText,
  getStatusColor,
  formatDate,
  formatCurrency
}) => {
  return (
    <div className="post-list-item">
      <div className="post-list-inner">
        {/* Image Section */}
        <div className="post-list-image-container">
          <img
            className="post-list-image"
            src={postImages[currentImageIndex]}
            alt={post.title || post.productName || "Product"}
            onError={(e) => {
              e.currentTarget.src =
                "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5OTkiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==";
            }}
          />
          
          {/* Image Navigation Arrows */}
          {hasMultipleImages && (
            <>
              <button
                className="post-image-nav prev"
                onClick={(e) => {
                  e.stopPropagation();
                  onPrevImage();
                }}
                aria-label="Previous image"
              >
                <i className="bi bi-chevron-left"></i>
              </button>
              <button
                className="post-image-nav next"
                onClick={(e) => {
                  e.stopPropagation();
                  onNextImage();
                }}
                aria-label="Next image"
              >
                <i className="bi bi-chevron-right"></i>
              </button>
              
              {/* Image Counter */}
              <div className="post-image-counter">
                {currentImageIndex + 1} / {postImages.length}
              </div>
            </>
          )}
          
          {/* Status Badge on Image */}
          <span className={`post-status-badge-image ${getStatusColor(post.status)}`}>
            {getStatusText(post.status)}
          </span>
        </div>

        {/* Content Section */}
        <div className="post-list-content">
          <div className="post-content-main">
            {/* Title and Menu */}
            <div className="post-header-row">
              <div>
                <h3 className="post-title">
                  {post.title || post.productName || "Không có tiêu đề"}
                </h3>
                <p className="post-description">
                  {post.description ||
                    post.vehicleInfo?.description ||
                    "Không có mô tả"}
                </p>
              </div>
              
              {/* Menu Dropdown */}
              <Dropdown align="end">
                <Dropdown.Toggle as="button" className="post-menu-button">
                  <i className="bi bi-three-dots-vertical" style={{ fontSize: "20px", color: "#6b7280" }}></i>
                </Dropdown.Toggle>
                <Dropdown.Menu className="post-menu-dropdown">
                  <Dropdown.Item className="post-menu-item" onClick={() => onEdit(post)}>
                    <i className="bi bi-pencil" style={{ color: "#2563eb" }}></i>
                    <span>Chỉnh sửa</span>
                  </Dropdown.Item>
                  {post.status === "ADMIN_APPROVED" && (
                    <Dropdown.Item
                      className="post-menu-item"
                      onClick={() => onPostProduct(post.id)}
                      disabled={postingProducts.has(post.id)}
                    >
                      <i className="bi bi-check-circle" style={{ color: "#10b981" }}></i>
                      <span>
                        {postingProducts.has(post.id) ? "Đang POST..." : "POST sản phẩm"}
                      </span>
                    </Dropdown.Item>
                  )}
                  <Dropdown.Item className="post-menu-item" onClick={() => onDelete(post)}>
                    <i className="bi bi-trash" style={{ color: "#ef4444" }}></i>
                    <span>Xóa</span>
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>

            {/* Category and Price */}
            <div className="post-price-row">
              <span className="post-category-badge">
                {post.category || post.productType || "VEHICLE"}
              </span>
              <span className="post-price">
                {formatCurrency(
                  post.price ||
                    post.vehicle?.price ||
                    post.battery?.price ||
                    0
                )}
              </span>
            </div>

            {/* Location */}
            <div className="post-location">
              <i className="bi bi-geo-alt"></i>
              <span>
                {post.location ||
                  post.address ||
                  post.sellerAddress ||
                  "Chưa có địa chỉ"}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="post-footer">
            <div className="post-footer-left">
              <div className="post-stat">
                <i className="bi bi-eye"></i>
                <span>{post.views || 0} lượt xem</span>
              </div>
              <div className="post-stat">
                <span>
                  Đăng:{" "}
                  {formatDate(
                    post.createdDate ||
                      post.createdAt ||
                      post.dateCreated
                  ) || "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;

