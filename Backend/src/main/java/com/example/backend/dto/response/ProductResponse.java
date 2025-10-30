package com.example.backend.dto.response;

import com.example.backend.enums.ProductStatus;
import com.example.backend.enums.ProductType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
    
    private Long id;
    private String title;
    private String description;
    private BigDecimal price;
    private ProductType productType;
    private ProductStatus status;
    private VehicleResponse vehicle;
    private BatteryResponse battery;
    private List<String> imageUrls;
    private Long sellerId;
    private String sellerName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String reason;
    private  String approvedLabel;
}

