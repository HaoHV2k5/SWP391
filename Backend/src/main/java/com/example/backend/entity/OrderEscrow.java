package com.example.backend.entity;

import com.example.backend.enums.EscrowStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "order_escrows")
public class OrderEscrow {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private EscrowStatus status;
    // HELD: Đang giữ tiền chờ nhận hàng
    // AWAIT_CONFIRM: Đợi buyer xác nhận
    // ADMIN_REVIEW: Seller đã gửi minh chứng lên admin
    // RELEASED: Đã chuyển tiền seller
    // REFUNDED (dự phòng nếu cần)

    @Column(name = "hold_start_time")
    private LocalDateTime holdStartTime; // lúc hệ thống bắt đầu giữ tiền

    @Column(name = "user_confirmed_time")
    private LocalDateTime userConfirmedTime; // nếu user xác nhận đã nhận hàng

    @Column(name = "expected_release_time")
    private LocalDateTime expectedReleaseTime; // mốc hệ thống sẽ giải phóng tiền (sau 3 ngày)

    @Column(name = "admin_involved")
    private Boolean adminInvolved;

    @Column(name = "seller_proof_image")
    private String sellerProofImage; // Đường dẫn ảnh minh chứng seller gửi cho admin

    @Column(name = "seller_order_code")
    private String sellerOrderCode; // Mã đơn hàng vận chuyển seller gửi admin

    @Column(name = "admin_review_time")
    private LocalDateTime adminReviewTime; // lúc admin kiểm tra

    @Column(name = "admin_sent_email_time")
    private LocalDateTime adminSentEmailTime; // lúc admin gửi email cho buyer

    @Column(name = "actual_release_time")
    private LocalDateTime actualReleaseTime; // lúc thật sự giải phóng tiền

    @Column(name = "admin_reject_reason")
    private String adminRejectReason; // lý do admin từ chối minh chứng

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
