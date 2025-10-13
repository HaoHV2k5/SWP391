package com.example.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor

public class WalletTransactionResponse {

    private Long id;
    private String transactionCode;
    private String typeWalletTraction;
    private java.math.BigDecimal amount;
    private java.math.BigDecimal balanceBefore;
    private java.math.BigDecimal balanceAfter;
    private String description;
    private String status;
    private java.time.LocalDateTime createdAt;
    private java.time.LocalDateTime updatedAt;
    private java.time.LocalDateTime completedAt;
}
