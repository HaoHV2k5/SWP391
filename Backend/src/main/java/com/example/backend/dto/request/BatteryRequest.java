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
public class BatteryRequest {
    
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

    private String batteryType; // loại pin
    private Double voltage; // điện áp danh định (V)
    private Double capacityAh; // dung lượng (Ah)
    private Integer sohPercent; // mức pin hiện tại (SoH %)
}
