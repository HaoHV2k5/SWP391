import { useState, useEffect } from "react";
import { Spinner, Card } from "react-bootstrap";
import { toast } from "react-toastify";
import reviewService from "../../services/reviewService";

const ReviewsAboutMe = ({ user }) => {
  const [reviews, setReviews] = useState({
    list: [],
    loading: false,
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 10
  });

  // Review stats state
  const [stats, setStats] = useState({
    loading: false,
    data: null
  });

  // Filter state
  const [filterRating, setFilterRating] = useState(0); // 0 = all, 1-5 = specific rating

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

  // Load reviews và stats
  useEffect(() => {
    const userId = getCurrentUserId();
    if (userId) {
      loadReviews(userId);
      loadStats(userId);
    }
  }, []);

  // Reload when filter changes
  useEffect(() => {
    const userId = getCurrentUserId();
    if (userId) {
      loadReviews(userId);
    }
  }, [filterRating]);

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
        setReviews(prev => ({
          ...prev,
          list: reviewData?.content || reviewData?.data || reviewData || [],
          totalElements: reviewData?.totalElements || 0,
          totalPages: reviewData?.totalPages || 0,
          currentPage: reviewData?.number || 0,
          loading: false
        }));
      } else {
        toast.error(result.message || "Lỗi tải reviews");
        setReviews(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error("Error loading reviews:", error);
      setReviews(prev => ({ ...prev, loading: false }));
    }
  };

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

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  // Render star rating
  const renderStars = (rating) => {
    return (
      <div className="star-rating d-inline-flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <i
            key={star}
            className={`bi ${star <= rating ? 'bi-star-fill' : 'bi-star'}`}
            style={{
              color: star <= rating ? '#ffc107' : '#dee2e6',
              fontSize: '0.9rem'
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <Card className="mb-4">
      <Card.Header>
        <h5 className="mb-0">
          <i className="bi bi-star-fill me-2" style={{ color: '#ffc107' }}></i>
          Đánh giá về tôi
        </h5>
      </Card.Header>
      <Card.Body>
        {/* Review Stats */}
        {stats.data && (
          <div className="review-stats mb-3 p-3" style={{
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#00A86B' }}>
                  {stats.data.averageRating ? stats.data.averageRating.toFixed(1) : '0.0'}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                  Dựa trên {stats.data.totalReviews || 0} đánh giá
                </div>
              </div>
              <div className="text-end">
                {renderStars(Math.round(stats.data.averageRating || 0))}
              </div>
            </div>
          </div>
        )}

        {/* Filter by Rating */}
        <div className="review-filter mb-3">
          <label className="form-label" style={{ fontSize: '0.9rem', fontWeight: 600 }}>
            Lọc theo đánh giá:
          </label>
          <div className="d-flex gap-1 flex-wrap">
            <button
              className={`btn btn-sm ${filterRating === 0 ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setFilterRating(0)}
            >
              Tất cả
            </button>
            {[5, 4, 3, 2, 1].map((rating) => (
              <button
                key={rating}
                className={`btn btn-sm ${filterRating === rating ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setFilterRating(rating)}
              >
                {rating} <i className="bi bi-star-fill" style={{ fontSize: '0.7rem', color: '#ffc107' }}></i>
              </button>
            ))}
          </div>
        </div>

        {/* Reviews List */}
        {reviews.loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" variant="success" />
            <p className="mt-2 text-muted">Đang tải đánh giá...</p>
          </div>
        ) : reviews.list.length > 0 ? (
          <div>
            <p className="text-muted mb-3">
              Có <strong>{reviews.totalElements}</strong> đánh giá {filterRating > 0 ? `${filterRating} sao` : ''}
            </p>
            {reviews.list.map((review) => (
              <div key={review.id} className="mb-3 p-3" style={{
                border: '1px solid #e9ecef',
                borderRadius: '8px',
                backgroundColor: '#f8f9fa'
              }}>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <strong style={{ fontSize: '0.95rem' }}>
                      {review.reviewerName || 'Người dùng'}
                    </strong>
                    <div className="mt-1">
                      {renderStars(review.rating || 0)}
                    </div>
                  </div>
                </div>
                {review.comment && (
                  <p className="mb-2" style={{ 
                    fontSize: '0.9rem', 
                    color: '#495057',
                    margin: 0
                  }}>
                    {review.comment}
                  </p>
                )}
                {review.imageUrls && review.imageUrls.length > 0 && (
                  <div className="review-images mt-2">
                    <div className="d-flex gap-1 flex-wrap">
                      {review.imageUrls.map((imgUrl, idx) => (
                        <img
                          key={idx}
                          src={imgUrl}
                          alt={`Review ${idx + 1}`}
                          style={{
                            width: '80px',
                            height: '80px',
                            objectFit: 'cover',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                          onClick={() => window.open(imgUrl, '_blank')}
                        />
                      ))}
                    </div>
                  </div>
                )}
                <div className="mt-2" style={{ fontSize: '0.75rem', color: '#6c757d' }}>
                  {formatDate(review.createdAt)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <i className="bi bi-inbox" style={{ fontSize: '3rem', color: '#dee2e6' }}></i>
            <p className="mt-3 text-muted">Chưa có đánh giá nào về bạn</p>
            <p className="text-muted" style={{ fontSize: '0.9rem' }}>
              Hãy bán hàng chất lượng để nhận được đánh giá tốt từ khách hàng nhé!
            </p>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default ReviewsAboutMe;

