import { useState, useEffect } from "react";
import { Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import reviewService from "../../services/reviewService";

const ReviewsSection = ({ user, sellerId, formatDate }) => {
  // Reviews state
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

  // Review form state
  const [reviewForm, setReviewForm] = useState({
    show: false,
    rating: 0,
    comment: "",
    images: [],
    submitting: false
  });

  // Load reviews when sellerId is available
  useEffect(() => {
    if (sellerId) {
      loadReviews(sellerId);
      loadStats(sellerId);
    }
  }, [sellerId]);

  // Reload when filter changes
  useEffect(() => {
    if (sellerId) {
      loadReviews(sellerId);
    }
  }, [filterRating]);

  // Load reviews function
  const loadReviews = async (sellerId, page = 0) => {
    setReviews(prev => ({ ...prev, loading: true }));
    try {
      const pageSize = 10; // Fixed page size
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

  // Handle review form submit
  const handleSubmitReview = async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để đánh giá");
      return;
    }

    if (!reviewForm.rating || reviewForm.rating < 1 || reviewForm.rating > 5) {
      toast.error("Vui lòng chọn đánh giá từ 1 đến 5 sao");
      return;
    }

    if (!sellerId) {
      toast.error("Không tìm thấy thông tin người bán");
      return;
    }

    setReviewForm(prev => ({ ...prev, submitting: true }));

    try {
      const reviewData = {
        revieweeId: sellerId,
        rating: reviewForm.rating,
        comment: reviewForm.comment.trim() || null,
        images: reviewForm.images
      };

      const result = await reviewService.createReview(reviewData);
      
      if (result.success) {
        toast.success(result.message || "Đánh giá thành công!");
        // Reset form
        setReviewForm({
          show: false,
          rating: 0,
          comment: "",
          images: [],
          submitting: false
        });
        // Reload reviews
        await loadReviews(sellerId);
      } else {
        toast.error(result.message || "Lỗi khi tạo đánh giá");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Có lỗi xảy ra khi tạo đánh giá");
    } finally {
      setReviewForm(prev => ({ ...prev, submitting: false }));
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

  // Handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setReviewForm(prev => ({
        ...prev,
        images: [...prev.images, ...files].slice(0, 5) // Limit to 5 images
      }));
    }
  };

  // Remove image from preview
  const handleRemoveImage = (index) => {
    setReviewForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
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
              fontSize: interactive ? '1.5rem' : '0.9rem'
            }}
            onClick={interactive && onRatingClick ? () => onRatingClick(star) : undefined}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="comments-section">
      <div className="comments-header mb-3">
        <h6 className="mb-0">
          <i className="bi bi-star-fill me-2" style={{ color: '#ffc107' }}></i>
          Đánh giá người bán
        </h6>
      </div>

      {/* Review Stats */}
      {stats.data && (
        <div className="review-stats mb-3 p-2" style={{
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #e9ecef'
        }}>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#00A86B' }}>
                {stats.data.averageRating ? stats.data.averageRating.toFixed(1) : '0.0'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6c757d' }}>
                {stats.data.totalReviews || 0} đánh giá
              </div>
            </div>
            <div className="text-end">
              {renderStars(Math.round(stats.data.averageRating || 0))}
            </div>
          </div>
        </div>
      )}

      {/* Filter by Rating */}
      <div className="review-filter mb-2">
        <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
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
      <div className="reviews-list" style={{ maxHeight: '500px', overflowY: 'auto' }}>
        {reviews.loading ? (
          <div className="text-center py-3">
            <Spinner size="sm" animation="border" variant="success" />
          </div>
        ) : reviews.list.length > 0 ? (
          reviews.list.map((review) => (
            <div key={review.id} className="review-item mb-3 p-3" style={{ 
              border: '1px solid #e9ecef', 
              borderRadius: '8px',
              backgroundColor: '#f8f9fa'
            }}>
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="reviewer-info">
                  <strong className="reviewer-name" style={{ fontSize: '0.9rem' }}>
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
                    style={{ fontSize: '0.8rem' }}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                )}
              </div>
              {review.comment && (
                <p className="review-comment mb-2" style={{ 
                  fontSize: '0.85rem', 
                  color: '#495057',
                  margin: 0
                }}>
                  {review.comment}
                </p>
              )}
              {review.imageUrls && review.imageUrls.length > 0 && (
                <div className="review-images mt-2">
                  <div className="d-flex gap-1 flex-wrap">
                    {review.imageUrls.slice(0, 3).map((imgUrl, idx) => (
                      <img
                        key={idx}
                        src={imgUrl}
                        alt={`Review ${idx + 1}`}
                        style={{
                          width: '60px',
                          height: '60px',
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
              <div className="review-date mt-2" style={{ fontSize: '0.75rem', color: '#6c757d' }}>
                {formatDate(review.createdAt)}
              </div>
            </div>
          ))
        ) : (
          <p className="no-comments-text text-center py-3">
            Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá!
          </p>
        )}
      </div>

      {/* Review Form */}
      {user ? (
        <div className="review-form-section mt-3">
          {!reviewForm.show ? (
            <button
              className="btn btn-success w-100"
              onClick={() => setReviewForm(prev => ({ ...prev, show: true }))}
            >
              <i className="bi bi-star me-2"></i>
              Viết đánh giá
            </button>
          ) : (
            <div className="review-form p-3" style={{ 
              border: '1px solid #dee2e6', 
              borderRadius: '8px',
              backgroundColor: '#fff'
            }}>
              <div className="mb-2">
                <label className="form-label" style={{ fontSize: '0.9rem' }}>
                  Đánh giá của bạn *
                </label>
                <div className="mb-2">
                  {renderStars(reviewForm.rating, true, (rating) => {
                    setReviewForm(prev => ({ ...prev, rating }));
                  })}
                </div>
              </div>
              <div className="mb-2">
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Viết đánh giá của bạn..."
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                  style={{ fontSize: '0.85rem' }}
                />
              </div>
              <div className="mb-2">
                <label className="form-label" style={{ fontSize: '0.9rem' }}>
                  Hình ảnh (tối đa 5 ảnh)
                </label>
                <input
                  type="file"
                  className="form-control form-control-sm"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={reviewForm.images.length >= 5}
                />
                {reviewForm.images.length > 0 && (
                  <div className="mt-2 d-flex gap-1 flex-wrap">
                    {reviewForm.images.map((img, idx) => (
                      <div key={idx} className="position-relative" style={{ width: '60px', height: '60px' }}>
                        <img
                          src={URL.createObjectURL(img)}
                          alt={`Preview ${idx + 1}`}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: '4px'
                          }}
                        />
                        <button
                          className="btn btn-sm btn-danger position-absolute"
                          style={{ top: '-5px', right: '-5px', padding: '2px 6px', fontSize: '0.7rem' }}
                          onClick={() => handleRemoveImage(idx)}
                        >
                          <i className="bi bi-x"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-success btn-sm flex-fill"
                  onClick={handleSubmitReview}
                  disabled={reviewForm.submitting || !reviewForm.rating}
                >
                  {reviewForm.submitting ? (
                    <>
                      <Spinner size="sm" animation="border" className="me-2" />
                      Đang gửi...
                    </>
                  ) : (
                    'Gửi đánh giá'
                  )}
                </button>
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => setReviewForm({
                    show: false,
                    rating: 0,
                    comment: "",
                    images: [],
                    submitting: false
                  })}
                  disabled={reviewForm.submitting}
                >
                  Hủy
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center mt-3">
          <p style={{ fontSize: '0.85rem', color: '#6c757d' }}>
            Vui lòng <a href="/login">đăng nhập</a> để đánh giá
          </p>
        </div>
      )}
    </div>
  );
};

export default ReviewsSection;

