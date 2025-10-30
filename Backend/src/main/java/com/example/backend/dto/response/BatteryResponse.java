package com.example.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BatteryResponse {
    private Long id;
    private String brand;
    private String model;
    private Integer yearManufactured;
    private Integer batteryLevel;
    private String batteryType;
    private Double voltage;
    private Double capacityAh;
    private Integer sohPercent;
}
