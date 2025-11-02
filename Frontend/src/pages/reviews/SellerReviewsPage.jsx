import { useState, useEffect } from "react";
import { useParams, useSearchParams, Link, useNavigate } from "react-router-dom";
import { Container, Spinner, Alert } from "react-bootstrap";
import { toast } from "react-toastify";
import reviewService from "../../services/reviewService";
import "../../components/homepageContainer/styles/ProductDetail.css";

const SellerReviewsPage = ({ user }) => {
  const { sellerId } = useParams();
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('productId');
  const navigate = useNavigate();
  
  // Reviews state
  const [reviews, setReviews] = useState({
    list: [],
    loading: true,
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 10
  });

  // Review stats state
  const [stats, setStats] = useState({
    loading: true,
    data: null
  });

  // Filter state
  const [filterRating, setFilterRating] = useState(0); // 0 = all, 1-5 = specific rating

  // Load reviews and stats when sellerId is available
  useEffect(() => {
    if (sellerId) {
      loadReviews(sellerId);
      loadStats(sellerId);
    }
  }, [sellerId, filterRating]);

  // Load reviews function
  const loadReviews = async (sellerId, page = 0) => {
    setReviews(prev => ({ ...prev, loading: true }));
    try {
      const pageSize = 10;
      let result;
      
      // Filter by rating if selected
      if (filterRating > 0 && filterRating <= 5) {
        result = await reviewService.getReviewsForSellerByRating(sellerId, filterRating, page, pageSize);
      } else {
        result = await reviewService.getReviewsForSeller(sellerId, page, pageSize);
      }
      
      if (result.success) {
        const reviewData = result.data;
        const list = reviewData?.content || reviewData?.data || reviewData || [];
        setReviews(prev => ({
          ...prev,
          list: list,
          totalElements: reviewData?.totalElements || 0,
          totalPages: reviewData?.totalPages || 0,
          currentPage: reviewData?.number || page || 0,
          loading: false
        }));
      } else {
        if (result.message && !result.message.includes('403') && !result.message.includes('không có quyền')) {
          toast.error(result.message || "Lỗi tải reviews");
        }
        setReviews(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error("Error loading reviews:", error);
      setReviews(prev => ({ ...prev, loading: false }));
    }
  };

  // Load stats function
  const loadStats = async (sellerId) => {
    setStats(prev => ({ ...prev, loading: true }));
    try {
      const result = await reviewService.getReviewStats(sellerId);
      if (result.success) {
        setStats({
          loading: false,
          data: result.data
        });
      } else {
        setStats(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error("Error loading stats:", error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  // Get current user ID
  const getCurrentUserId = () => {
    try {
      const raw = localStorage.getItem("userData");
      if (raw) {
        const parsed = JSON.parse(raw);
        return parsed?.id || parsed?.user?.id || parsed?.userId || null;
      }
    } catch (e) {
      return null;
    }
    return null;
  };

  // Handle delete review
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa đánh giá này?")) {
      return;
    }

    try {
      const result = await reviewService.deleteReview(reviewId);
      if (result.success) {
        toast.success(result.message || "Xóa đánh giá thành công!");
        // Reload reviews and stats
        if (sellerId) {
          await loadReviews(sellerId);
          await loadStats(sellerId);
        }
      } else {
        toast.error(result.message || "Lỗi khi xóa đánh giá");
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Có lỗi xảy ra khi xóa đánh giá");
    }
  };

  // Render star rating
  const renderStars = (rating, interactive = false, onRatingClick = null) => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <i
            key={star}
            className={`bi ${star <= rating ? 'bi-star-fill' : 'bi-star'}`}
            style={{
              color: star <= rating ? '#ffc107' : '#dee2e6',
              cursor: interactive ? 'pointer' : 'default',
              fontSize: interactive ? '1.5rem' : '1rem'
            }}
            onClick={interactive && onRatingClick ? () => onRatingClick(star) : undefined}
          />
        ))}
      </div>
    );
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Handle pagination
  const handlePageChange = (page) => {
    if (sellerId && page >= 0 && page < reviews.totalPages) {
      loadReviews(sellerId, page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (!sellerId) {
    return (
      <Container className="py-5">
        <Alert variant="danger">Không tìm thấy thông tin người bán</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/">Trang chủ</Link>
          </li>
          {productId && (
            <li className="breadcrumb-item">
              <Link to={`/product/${productId}`}>Chi tiết sản phẩm</Link>
            </li>
          )}
          <li className="breadcrumb-item active" aria-current="page">
            Đánh giá người bán
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="mb-4">
        <h2 className="mb-2">
          <i className="bi bi-star-fill me-2" style={{ color: '#ffc107' }}></i>
          Đánh giá người bán
        </h2>
        {productId && (
          <Link to={`/product/${productId}`} className="text-decoration-none">
            <i className="bi bi-arrow-left me-2"></i>
            Quay lại chi tiết sản phẩm
          </Link>
        )}
      </div>

      {/* Review Stats and Filter - Combined */}
      <div className="card mb-4">
        <div className="card-body">
          {/* Review Stats */}
          {stats.loading ? (
            <div className="text-center py-3">
              <Spinner size="sm" animation="border" variant="success" />
            </div>
          ) : stats.data ? (
            <div className="d-flex align-items-center mb-4">
              <div className="me-4">
                <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#00A86B', lineHeight: 1 }}>
                  {stats.data.averageRating ? stats.data.averageRating.toFixed(1) : '0.0'}
                </div>
                <div className="mt-2">
                  {renderStars(Math.round(stats.data.averageRating || 0))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#495057' }}>
                  {stats.data.totalReviews || 0} đánh giá
                </div>
                <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                  Dựa trên {stats.data.totalReviews || 0} đánh giá từ người mua
                </div>
              </div>
            </div>
          ) : (
            <div className="d-flex align-items-center mb-4">
              <div className="me-4">
                <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#00A86B', lineHeight: 1 }}>
                  0.0
                </div>
                <div className="mt-2">
                  {renderStars(0)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#495057' }}>
                  0 đánh giá
                </div>
                <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                  Dựa trên 0 đánh giá từ người mua
                </div>
              </div>
            </div>
          )}

          {/* Divider */}
          <hr className="my-3" />

          {/* Filter by Rating */}
          <div>
            <label className="form-label fw-bold mb-3">Lọc theo đánh giá:</label>
            <div className="d-flex gap-2 flex-wrap">
              <button
                className={`btn ${filterRating === 0 ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setFilterRating(0)}
              >
                Tất cả
              </button>
              {[5, 4, 3, 2, 1].map((rating) => (
                <button
                  key={rating}
                  className={`btn ${filterRating === rating ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setFilterRating(rating)}
                >
                  {rating} <i className="bi bi-star-fill" style={{ fontSize: '0.8rem', color: '#ffc107' }}></i>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">Tất cả đánh giá ({reviews.totalElements})</h5>
        </div>
        <div className="card-body">
          {reviews.loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="success" className="mb-3" />
              <div className="text-muted">Đang tải đánh giá...</div>
            </div>
          ) : Array.isArray(reviews.list) && reviews.list.length > 0 ? (
            <>
              {reviews.list.map((review) => (
                <div key={review.id} className="border-bottom pb-3 mb-3">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="reviewer-info">
                      <strong className="reviewer-name" style={{ fontSize: '1rem' }}>
                        {review.reviewerName || 'Người dùng'}
                      </strong>
                      <div className="review-rating mt-1">
                        {renderStars(review.rating || 0)}
                      </div>
                    </div>
                    {user && getCurrentUserId() === review.reviewerId && (
                      <button
                        className="btn btn-sm btn-link text-danger p-0"
                        onClick={() => handleDeleteReview(review.id)}
                      >
                        <i className="bi bi-trash"></i> Xóa
                      </button>
                    )}
                  </div>
                  {review.comment && (
                    <p className="review-comment mb-2" style={{ 
                      fontSize: '0.95rem', 
                      color: '#495057',
                      lineHeight: 1.6
                    }}>
                      {review.comment}
                    </p>
                  )}
                  {review.imageUrls && review.imageUrls.length > 0 && (
                    <div className="review-images mt-2">
                      <div className="d-flex gap-2 flex-wrap">
                        {review.imageUrls.map((imgUrl, idx) => (
                          <img
                            key={idx}
                            src={imgUrl}
                            alt={`Review ${idx + 1}`}
                            style={{
                              width: '120px',
                              height: '120px',
                              objectFit: 'cover',
                              borderRadius: '8px',
                              cursor: 'pointer'
                            }}
                            onClick={() => window.open(imgUrl, '_blank')}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="review-date mt-2" style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                    <i className="bi bi-clock me-1"></i>
                    {formatDate(review.createdAt)}
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {reviews.totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                  <nav>
                    <ul className="pagination">
                      <li className={`page-item ${reviews.currentPage === 0 ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(reviews.currentPage - 1)}
                          disabled={reviews.currentPage === 0}
                        >
                          Trước
                        </button>
                      </li>
                      {[...Array(reviews.totalPages)].map((_, idx) => {
                        if (
                          idx === 0 ||
                          idx === reviews.totalPages - 1 ||
                          (idx >= reviews.currentPage - 2 && idx <= reviews.currentPage + 2)
                        ) {
                          return (
                            <li
                              key={idx}
                              className={`page-item ${reviews.currentPage === idx ? 'active' : ''}`}
                            >
                              <button
                                className="page-link"
                                onClick={() => handlePageChange(idx)}
                              >
                                {idx + 1}
                              </button>
                            </li>
                          );
                        } else if (idx === reviews.currentPage - 3 || idx === reviews.currentPage + 3) {
                          return (
                            <li key={idx} className="page-item disabled">
                              <span className="page-link">...</span>
                            </li>
                          );
                        }
                        return null;
                      })}
                      <li className={`page-item ${reviews.currentPage >= reviews.totalPages - 1 ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(reviews.currentPage + 1)}
                          disabled={reviews.currentPage >= reviews.totalPages - 1}
                        >
                          Sau
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-5">
              <i className="bi bi-inbox" style={{ fontSize: '3rem', color: '#dee2e6' }}></i>
              <p className="mt-3 text-muted">Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá!</p>
            </div>
          )}
        </div>
      </div>

    </Container>
  );
};

export default SellerReviewsPage;

