package com.example.backend.controller;

import com.example.backend.dto.request.CreateReviewRequest;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.response.ReviewResponse;
import com.example.backend.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("reviews")
@Slf4j
@Tag(name = "Review Management", description = "APIs for managing reviews")
public class ReviewController {
    
    private final ReviewService reviewService;
    
    // User tạo review cho seller
    @PreAuthorize("hasAuthority('ROLE_USER') or hasAuthority('ROLE_SELLER')")
    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Create a review", description = "User creates a review for a seller")
    @SecurityRequirement(name = "bearerAuth")
    public ApiResponse<ReviewResponse> createReview(
            @Valid @ModelAttribute CreateReviewRequest request,
            @RequestParam String username) {
        
        log.info("Creating review for seller {} by user {}", request.getRevieweeId(), username);
        
        ReviewResponse reviewResponse = reviewService.createReview(request, username);
        
        return ApiResponse.<ReviewResponse>builder()
                .message("Tạo review thành công")
                .data(reviewResponse)
                .build();
    }
    
    // Xem tất cả review của seller (public - mọi người đều có thể xem)
    @GetMapping("/seller/{sellerId}")
    @Operation(summary = "Get reviews for seller", description = "Get all reviews for a specific seller (public access)")
    public ApiResponse<Page<ReviewResponse>> getReviewsForSeller(
            @PathVariable Long sellerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        log.info("Getting reviews for seller {} with page {} and size {}", sellerId, page, size);
        
        Page<ReviewResponse> reviews = reviewService.getReviewsForSeller(sellerId, page, size);
        
        return ApiResponse.<Page<ReviewResponse>>builder()
                .message("Lấy danh sách review thành công")
                .data(reviews)
                .build();
    }
    
    // Xem review theo rating cụ thể (public - mọi người đều có thể xem)
    @GetMapping("/seller/{sellerId}/rating/{rating}")
    @Operation(summary = "Get reviews by rating", description = "Get reviews for a seller filtered by specific rating (public access)")
    public ApiResponse<Page<ReviewResponse>> getReviewsForSellerByRating(
            @PathVariable Long sellerId,
            @PathVariable Integer rating,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        log.info("Getting reviews for seller {} with rating {} with page {} and size {}", sellerId, rating, page, size);
        
        Page<ReviewResponse> reviews = reviewService.getReviewsForSellerByRating(sellerId, rating, page, size);
        
        return ApiResponse.<Page<ReviewResponse>>builder()
                .message("Lấy danh sách review theo rating thành công")
                .data(reviews)
                .build();
    }
    
    // Xem thống kê review (public - mọi người đều có thể xem)
    @GetMapping("/seller/{sellerId}/stats")
    @Operation(summary = "Get review statistics", description = "Get review statistics for a seller (public access)")
    public ApiResponse<ReviewService.ReviewStatsResponse> getReviewStats(
            @PathVariable Long sellerId) {
        
        log.info("Getting review stats for seller {}", sellerId);
        
        ReviewService.ReviewStatsResponse stats = reviewService.getReviewStats(sellerId);
        
        return ApiResponse.<ReviewService.ReviewStatsResponse>builder()
                .message("Lấy thống kê review thành công")
                .data(stats)
                .build();
    }
    
    // User xem review mà mình đã viết
    @PreAuthorize("hasAuthority('ROLE_USER') or hasAuthority('ROLE_SELLER')")
    @GetMapping("/user/{userId}")
    @Operation(summary = "Get reviews by user", description = "Get all reviews written by a specific user")
    @SecurityRequirement(name = "bearerAuth")
    public ApiResponse<Page<ReviewResponse>> getReviewsByUser(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        log.info("Getting reviews by user {} with page {} and size {}", userId, page, size);
        
        Page<ReviewResponse> reviews = reviewService.getReviewsByUser(userId, page, size);
        
        return ApiResponse.<Page<ReviewResponse>>builder()
                .message("Lấy danh sách review của user thành công")
                .data(reviews)
                .build();
    }
    
    // User xóa review của mình
    @PreAuthorize("hasAuthority('ROLE_USER') or hasAuthority('ROLE_SELLER')")
    @DeleteMapping("/{reviewId}")
    @Operation(summary = "Delete review", description = "Delete a review (only reviewer can delete)")
    @SecurityRequirement(name = "bearerAuth")
    public ApiResponse<Void> deleteReview(
            @PathVariable Long reviewId,
            @RequestParam String username) {
        
        log.info("Deleting review {} by user {}", reviewId, username);
        
        reviewService.deleteReview(reviewId, username);
        
        return ApiResponse.<Void>builder()
                .message("Xóa review thành công")
                .build();
    }
}
