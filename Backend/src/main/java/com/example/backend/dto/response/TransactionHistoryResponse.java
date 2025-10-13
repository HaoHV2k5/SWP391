package com.example.backend.dto.response;

import com.example.backend.entity.PostingPackage;
import com.example.backend.entity.User;
import com.example.backend.entity.Wallet;
import com.example.backend.enums.PaymentMethod;
import com.example.backend.enums.TransactionStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TransactionHistoryResponse {
    private String transactionCode;
    private Long userId;
    private PostingPackageSimpleResponse postingPackage;
    private BigDecimal amount;
    private PaymentMethod paymentMethod;
    private TransactionStatus status;
    private String description;
    private Boolean isWalletPayment;
    private Long walletId;
    private LocalDateTime paymentDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
