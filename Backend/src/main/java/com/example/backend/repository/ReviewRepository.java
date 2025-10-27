package com.example.backend.repository;

import com.example.backend.entity.Review;
import com.example.backend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    
    // Lấy tất cả review của một seller (reviewee)
    Page<Review> findByRevieweeOrderByCreatedAtDesc(User reviewee, Pageable pageable);
    
    // Lấy review của một user cụ thể cho một seller cụ thể
    Review findByReviewerAndReviewee(User reviewer, User reviewee);
    
    // Lấy tất cả review mà một user đã viết
    Page<Review> findByReviewerOrderByCreatedAtDesc(User reviewer, Pageable pageable);
    
    // Tính điểm trung bình rating của một seller
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.reviewee.id = :revieweeId")
    Double getAverageRatingByRevieweeId(@Param("revieweeId") Long revieweeId);
    
    // Đếm số lượng review của một seller
    @Query("SELECT COUNT(r) FROM Review r WHERE r.reviewee.id = :revieweeId")
    Long countByRevieweeId(@Param("revieweeId") Long revieweeId);
    
    // Lấy review theo rating cụ thể của một seller
    @Query("SELECT r FROM Review r WHERE r.reviewee.id = :revieweeId AND r.rating = :rating ORDER BY r.createdAt DESC")
    Page<Review> findByRevieweeIdAndRatingOrderByCreatedAtDesc(@Param("revieweeId") Long revieweeId, @Param("rating") Integer rating, Pageable pageable);
}
