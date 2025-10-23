package com.example.backend.dto.response;

import com.example.backend.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderResponse {
    private Long id;

    private Long buyerId;
    private String buyerName;

    private Long sellerId;
    private String sellerName;

    private Long productId;
    private String productName;

    private BigDecimal offeredPrice;
    

    private OrderStatus status;


    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime respondedAt;
}
