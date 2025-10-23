package com.example.backend.dto.response;

import com.example.backend.enums.ContractStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContractResponse {
    private Long id;
    private String contractCode;
    private Long orderId;
    private Long buyerId;
    private String buyerName;
    private Long sellerId;
    private String sellerName;
    private Long productId;
    private String productName;
    private BigDecimal agreedPrice;
    private ContractStatus status;
    private Boolean sellerSigned;
    private Boolean buyerSigned;
    private Boolean paymentCompleted;
    private Boolean deliveryCompleted;
    private LocalDateTime createdAt;
    private LocalDateTime signedAt;
    private LocalDateTime completedAt;
}
