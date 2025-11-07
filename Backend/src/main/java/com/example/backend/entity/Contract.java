package com.example.backend.entity;

import com.example.backend.enums.ContractStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "contracts")
public class Contract {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String contractCode;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_id", nullable = false)
    private User buyer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private User seller;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal agreedPrice;

    @Column(columnDefinition = "NVARCHAR(1000)")
    private String terms;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ContractStatus status = ContractStatus.PENDING; // sau khi ca hai khi xong

    @Column(name = "buyer_signed")
    @Builder.Default
    private Boolean buyerSigned = false; // sau khi ca hai khi xong

    @Column(name = "seller_signed")
    @Builder.Default
    private Boolean sellerSigned = false;// sau khi ca hai khi xong

    @Column(name = "payment_completed")
    @Builder.Default
    private Boolean paymentCompleted = false; // update khi thanh toan

    @Column(name = "delivery_completed")
    @Builder.Default
    private Boolean deliveryCompleted = false; // khi ng mua nhan nut xac nhan nhan hang

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transaction_id")
    private Transaction transaction; // khi thanh toan

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "signed_at")
    private LocalDateTime signedAt; // khi tao hop dong

    @Column(name = "email_notice")
    @Builder.Default
    private boolean postEmail = false; //

    @Column(name = "completed_at")
    private LocalDateTime completedAt; // sau khi release tien cho seller

    @Column(name = "buyer_sign_remind_sent")
    @Builder.Default
    private boolean buyerSignRemindSent = false;

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
