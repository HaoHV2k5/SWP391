package com.example.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderEscrowReviewResponse {
    private Long escrowId;
    private Long orderId;
    private String sellerProofImage;
    private String sellerOrderCode;
    private Long sellerId;
}
