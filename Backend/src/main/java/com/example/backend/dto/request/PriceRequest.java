package com.example.backend.dto.request;

import lombok.Data;

@Data
public class PriceRequest {
    private String type; // "vehicle" hoặc "battery"
    private String brand;
    private String model;
    private Integer yearManufactured;
    private Long odometer; // với vehicle
    private String batteryType;
    private Double batteryCapacityKWh;
    private Integer rangePerChargeKm;
    private Integer batteryLevel; // với battery
    private Double voltage;
    private Double capacityAh;
    private Integer sohPercent;
}
