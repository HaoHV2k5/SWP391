package com.example.backend.entity;

import com.example.backend.enums.WalletTransactionType;
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
@Table(name = "wallet_transactions")
public class WalletTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String transactionCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wallet_id", nullable = false)
    private Wallet wallet;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "NVARCHAR(20)")

    private WalletTransactionType typeWalletTraction; // DEPOSIT, PAYMENT_PACKAGE, PAYMENT_PRODUCT

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(precision = 15, scale = 2)
    private BigDecimal balanceBefore;

    @Column(precision = 15, scale = 2)
    private BigDecimal balanceAfter;

    @Column(columnDefinition = "NVARCHAR(255)")
    private String description;

    @Column(nullable = false, columnDefinition = "NVARCHAR(20)")
    private String status; // PENDING, COMPLETED, FAILED, CANCELLED

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reference_transaction_id")
    private Transaction referenceTransaction;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "posting_package_id")
    private PostingPackage postingPackage;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    // Thông tin ngân hàng cho rút tiền
    @Column(name = "bank_info", columnDefinition = "NVARCHAR(255)")
    private String bankInfo;
    
    @Column(name = "account_number", columnDefinition = "NVARCHAR(50)")
    private String accountNumber;
    
    @Column(name = "account_holder_name", columnDefinition = "NVARCHAR(100)")
    private String accountHolderName;

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
