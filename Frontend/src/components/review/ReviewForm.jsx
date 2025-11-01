import { useState } from "react";
import { Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import reviewService from "../../services/reviewService";

const ReviewForm = ({ user, sellerId, onSuccess }) => {
  // Review form state
  const [reviewForm, setReviewForm] = useState({
    show: false,
    rating: 0,
    comment: "",
    images: [],
    submitting: false
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
        // Callback để reload reviews nếu cần
        if (onSuccess) {
          onSuccess(result.data);
        }
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

  if (!user) {
    return (
      <div className="card">
        <div className="card-body text-center">
          <p className="mb-0" style={{ fontSize: '0.9rem', color: '#6c757d' }}>
            <a href="/login" className="text-decoration-none">Đăng nhập</a> để viết đánh giá
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h6 className="mb-0">
          <i className="bi bi-star-fill me-2" style={{ color: '#ffc107' }}></i>
          Viết đánh giá
        </h6>
      </div>
      <div className="card-body">
        {!reviewForm.show ? (
          <button
            className="btn btn-success w-100"
            onClick={() => setReviewForm(prev => ({ ...prev, show: true }))}
          >
            <i className="bi bi-star me-2"></i>
            Viết đánh giá
          </button>
        ) : (
          <div className="review-form">
            <div className="mb-3">
              <label className="form-label fw-bold">
                Đánh giá của bạn *
              </label>
              <div className="mt-2">
                {renderStars(reviewForm.rating, true, (rating) => {
                  setReviewForm(prev => ({ ...prev, rating }));
                })}
              </div>
            </div>
            <div className="mb-3">
              <textarea
                className="form-control"
                rows="3"
                placeholder="Viết đánh giá của bạn..."
                value={reviewForm.comment}
                onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                style={{ fontSize: '0.9rem' }}
              />
            </div>
            <div className="mb-3">
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
    </div>
  );
};

export default ReviewForm;

