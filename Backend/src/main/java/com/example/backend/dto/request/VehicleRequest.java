package com.example.backend.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleRequest {
    
    @Size(max = 255, message = "BRAND_TOO_LONG")
    private String brand;
    
    @Size(max = 255, message = "MODEL_TOO_LONG")
    private String model;
    
    @Min(value = 1900, message = "YEAR_MANUFACTURED_INVALID")
    @Max(value = 2030, message = "YEAR_MANUFACTURED_INVALID")
    private Integer yearManufactured;
}
