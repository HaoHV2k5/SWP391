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
@Table(name = "batteries")
public class Battery {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "NVARCHAR(255)")
    private String brand;

    @Column(columnDefinition = "NVARCHAR(255)")
    private String model;

    @Column(name = "year_manufactured")
    private Integer yearManufactured;

    @Column(name = "battery_level")
    private Integer batteryLevel;

    @OneToOne(mappedBy = "battery")
    private Product product;
}
