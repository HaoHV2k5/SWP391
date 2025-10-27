package com.example.backend.service;

import com.example.backend.dto.request.CreateReviewRequest;
import com.example.backend.dto.response.ReviewResponse;
import com.example.backend.entity.Review;
import com.example.backend.entity.User;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.ReviewMapper;
import com.example.backend.repository.ReviewRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.OrderRespository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewService {
    
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final OrderRespository orderRepository;
    private final CloudinaryService cloudinaryService;
    private final ReviewMapper reviewMapper;
    
    /**
     * Tạo review mới cho seller
     */
    public ReviewResponse createReview(CreateReviewRequest request, String reviewerUsername) {
        // Tìm reviewer
        User reviewer = userRepository.findByUsername(reviewerUsername)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        
        // Tìm reviewee (seller)
        User reviewee = userRepository.findById(request.getRevieweeId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        
        // Kiểm tra xem reviewer đã review seller này chưa
        Review existingReview = reviewRepository.findByReviewerAndReviewee(reviewer, reviewee);
        if (existingReview != null) {
            throw new AppException(ErrorCode.REVIEW_ALREADY_EXISTS);
        }
        
        // Kiểm tra xem reviewer đã mua hàng thành công từ seller này chưa
        boolean hasCompletedPurchase = orderRepository.hasCompletedPurchase(reviewer.getId(), reviewee.getId());
        if (!hasCompletedPurchase) {
            throw new AppException(ErrorCode.PURCHASE_NOT_COMPLETED);
        }
        
        // Upload images nếu có
        List<String> imageUrls = new ArrayList<>();
        if (request.getImages() != null && !request.getImages().isEmpty()) {
            for (MultipartFile image : request.getImages()) {
                try {
                    String imageUrl = cloudinaryService.upload(image);
                    imageUrls.add(imageUrl);
                } catch (Exception e) {
                    log.error("Error uploading image: {}", e.getMessage());
                    throw new AppException(ErrorCode.UPLOAD_FAILED);
                }
            }
        }
        
        // Tạo review
        Review review = Review.builder()
                .reviewer(reviewer)
                .reviewee(reviewee)
                .rating(request.getRating())
                .comment(request.getComment())
                .imageUrls(imageUrls)
                .build();
        
        Review savedReview = reviewRepository.save(review);
        
        return reviewMapper.toReviewResponse(savedReview);
    }
    
    /**
     * Lấy tất cả review của một seller (cho seller đọc)
     */
    public Page<ReviewResponse> getReviewsForSeller(Long sellerId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        Page<Review> reviews = reviewRepository.findByRevieweeOrderByCreatedAtDesc(seller, pageable);
        return reviews.map(reviewMapper::toReviewResponse);
    }
    
    /**
     * Lấy review theo rating cụ thể của một seller
     */
    public Page<ReviewResponse> getReviewsForSellerByRating(Long sellerId, Integer rating, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Review> reviews = reviewRepository.findByRevieweeIdAndRatingOrderByCreatedAtDesc(sellerId, rating, pageable);
        return reviews.map(reviewMapper::toReviewResponse);
    }
    
    /**
     * Lấy thống kê review của seller
     */
    public ReviewStatsResponse getReviewStats(Long sellerId) {
        Double averageRating = reviewRepository.getAverageRatingByRevieweeId(sellerId);
        Long totalReviews = reviewRepository.countByRevieweeId(sellerId);
        
        return ReviewStatsResponse.builder()
                .averageRating(averageRating != null ? averageRating : 0.0)
                .totalReviews(totalReviews)
                .build();
    }
    
    /**
     * Lấy review mà user đã viết
     */
    public Page<ReviewResponse> getReviewsByUser(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        Page<Review> reviews = reviewRepository.findByReviewerOrderByCreatedAtDesc(user, pageable);
        return reviews.map(reviewMapper::toReviewResponse);
    }
    
    /**
     * Xóa review (chỉ reviewer mới có thể xóa)
     */
    public void deleteReview(Long reviewId, String username) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_NOT_FOUND));
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        
        // Chỉ reviewer mới có thể xóa review của mình
        if (review.getReviewer().getId() != user.getId()) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }
        
        reviewRepository.delete(review);
    }
    
    // Inner class cho thống kê review
    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class ReviewStatsResponse {
        private Double averageRating;
        private Long totalReviews;
    }
}
