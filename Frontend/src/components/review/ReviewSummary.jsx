import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import reviewService from "../../services/reviewService";

const ReviewSummary = ({ sellerId, productId }) => {
  const [stats, setStats] = useState({
    loading: true,
    data: null
  });

  useEffect(() => {
    if (sellerId) {
      loadStats(sellerId);
    }
  }, [sellerId]);

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

  // Render star rating
  const renderStars = (rating) => {
    return (
      <div className="star-rating">
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
    <div className="card">
      <div className="card-header">
        <h6 className="mb-0">
          <i className="bi bi-star-fill me-2" style={{ color: '#ffc107' }}></i>
          Đánh giá người bán
        </h6>
      </div>
      <div className="card-body">
        {stats.loading ? (
          <div className="text-center py-3">
            <Spinner size="sm" animation="border" variant="success" />
          </div>
        ) : stats.data ? (
          <>
            <div className="mb-3">
              <div className="d-flex align-items-center mb-2">
                <div className="me-3">
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#00A86B', lineHeight: 1 }}>
                    {stats.data.averageRating ? stats.data.averageRating.toFixed(1) : '0.0'}
                  </div>
                </div>
                <div className="flex-grow-1">
                  {renderStars(Math.round(stats.data.averageRating || 0))}
                  <div style={{ fontSize: '0.85rem', color: '#6c757d', marginTop: '4px' }}>
                    {stats.data.totalReviews || 0} đánh giá
                  </div>
                </div>
              </div>
            </div>
            <Link
              to={`/reviews/seller/${sellerId}${productId ? `?productId=${productId}` : ''}`}
              className="btn btn-outline-primary w-100"
            >
              <i className="bi bi-eye me-2"></i>
              Xem tất cả đánh giá
            </Link>
          </>
        ) : (
          <div className="text-center py-2">
            <p className="text-muted mb-2" style={{ fontSize: '0.85rem' }}>
              Chưa có đánh giá nào
            </p>
            {sellerId && (
              <Link
                to={`/reviews/seller/${sellerId}${productId ? `?productId=${productId}` : ''}`}
                className="btn btn-sm btn-outline-primary"
              >
                Xem đánh giá
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewSummary;

