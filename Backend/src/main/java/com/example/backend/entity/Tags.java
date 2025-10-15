package com.example.backend.entity;

import com.example.backend.enums.ProductType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "tags")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Tags {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String slugs;
    private String displayName;
    private String brand;
    private String model;
    private Integer yearModel;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40, name = "type_product")
    private ProductType type;

    @OneToMany(mappedBy = "tag")
    private List<Product> products;
}
