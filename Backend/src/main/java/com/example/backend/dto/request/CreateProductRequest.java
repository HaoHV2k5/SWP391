package com.example.backend.dto.request;

import com.example.backend.enums.ProductType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.JoinColumn;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

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
    
    @Valid
    private VehicleRequest vehicle;
    
    @Valid
    private BatteryRequest battery;

    private List<MultipartFile> images;

}

