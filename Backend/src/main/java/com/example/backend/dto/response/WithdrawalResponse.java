package com.example.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class WithdrawalResponse {
    
    private Long id;
    private String transactionCode;
    private BigDecimal amount;
    private BigDecimal balanceBefore;
    private BigDecimal balanceAfter;
    private String bankInfo;
    private String accountNumber;
    private String accountHolderName;
    private String status;
    private String note;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
}
