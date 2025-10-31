import { useState, useEffect } from "react";
import { Spinner, Card } from "react-bootstrap";
import { toast } from "react-toastify";
import reviewService from "../../services/reviewService";

const MyReviews = ({ user }) => {
  const [reviews, setReviews] = useState({
    list: [],
    loading: false,
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 10
  });

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

  // Load reviews
  useEffect(() => {
    const userId = getCurrentUserId();
    if (userId) {
      loadReviews(userId);
    }
  }, []);

  const loadReviews = async (userId, page = 0) => {
    setReviews(prev => ({ ...prev, loading: true }));
    try {
      const pageSize = 10;
      const result = await reviewService.getReviewsByUser(userId, page, pageSize);
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

  // Handle delete review
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa đánh giá này?")) {
      return;
    }

    try {
      const result = await reviewService.deleteReview(reviewId);
      if (result.success) {
        toast.success(result.message || "Xóa đánh giá thành công!");
        // Reload reviews
        const userId = getCurrentUserId();
        if (userId) {
          await loadReviews(userId);
        }
      } else {
        toast.error(result.message || "Lỗi khi xóa đánh giá");
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Có lỗi xảy ra khi xóa đánh giá");
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
          Đánh giá tôi đã viết
        </h5>
        <small className="text-muted">Các đánh giá bạn đã viết về người bán</small>
      </Card.Header>
      <Card.Body>
        {reviews.loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" variant="success" />
            <p className="mt-2 text-muted">Đang tải đánh giá...</p>
          </div>
        ) : reviews.list.length > 0 ? (
          <div>
            <p className="text-muted mb-3">
              Bạn đã viết <strong>{reviews.totalElements}</strong> đánh giá
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
                      Đánh giá cho: {review.revieweeName || 'Người bán'}
                    </strong>
                    <div className="mt-1">
                      {renderStars(review.rating || 0)}
                    </div>
                  </div>
                  <button
                    className="btn btn-sm btn-link text-danger p-0"
                    onClick={() => handleDeleteReview(review.id)}
                    style={{ fontSize: '0.8rem' }}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
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
            <p className="mt-3 text-muted">Bạn chưa viết đánh giá nào</p>
            <p className="text-muted" style={{ fontSize: '0.9rem' }}>
              Hãy mua sản phẩm và đánh giá người bán để giúp cộng đồng nhé!
            </p>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default MyReviews;

