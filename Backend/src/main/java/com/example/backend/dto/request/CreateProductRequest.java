package com.example.backend.dto.request;

import com.example.backend.enums.ProductType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.JoinColumn;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateProductRequest {
    
    @NotBlank(message = "TITLE_REQUIRED")
    @Size(max = 255, message = "TITLE_TOO_LONG")
    private String title;
    
    @Size(max = 1000, message = "DESCRIPTION_TOO_LONG")
    private String description;
    
    @NotNull(message = "PRICE_REQUIRED")
    @DecimalMin(value = "0.0", inclusive = false, message = "PRICE_INVALID")
    private BigDecimal price;
    
    @NotNull(message = "PRODUCT_TYPE_REQUIRED")
    private ProductType productType;
    
    @Size(max = 255, message = "BRAND_TOO_LONG")
    private String brand;
    
    @Size(max = 255, message = "MODEL_TOO_LONG")
    private String model;
    
    @Min(value = 1900, message = "YEAR_MANUFACTURED_INVALID")
    @Max(value = 2030, message = "YEAR_MANUFACTURED_INVALID")
    private Integer yearManufactured;
    
    @Min(value = 0, message = "BATTERY_LEVEL_INVALID")
    @Max(value = 100, message = "BATTERY_LEVEL_INVALID")
    private Integer batteryLevel;

    private List<String> imageUrls;
}

