package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "vehicles")
public class Vehicle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "NVARCHAR(255)")
    private String brand;

    @Column(columnDefinition = "NVARCHAR(255)")
    private String model;

    @Column(name = "year_manufactured")
    private Integer yearManufactured;

    @Column(name = "odometer")
    private Long odometer; // số km đã đi

    @Column(name = "battery_type")
    private String batteryType; // loại pin

    @Column(name = "battery_capacity_kwh")
    private Double batteryCapacityKWh; // dung lượng pin (kWh)

    @Column(name = "range_per_charge_km")
    private Integer rangePerChargeKm; // quãng đường 1 lần sạc (km)

    @OneToOne(mappedBy = "vehicle")
    private Product product;
}
