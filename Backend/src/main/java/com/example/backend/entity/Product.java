package com.example.backend.entity;

import com.example.backend.enums.ProductStatus;
import com.example.backend.enums.ProductType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@Setter
@ToString(exclude = {"vehicle", "battery"})
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "NVARCHAR(255)")
    private String title;

    @Column(columnDefinition = "NVARCHAR(255)")
    private String description;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal price;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private ProductType productType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false , length = 50)
    @Builder.Default
    private ProductStatus status = ProductStatus.PENDING;

    @Column(length = 50, name = "reason")
    private String reason;

    private boolean isPosted = false;
    
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "vehicle_id")
    private Vehicle vehicle;
    
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "battery_id")
    private Battery battery;
    @ElementCollection
    @CollectionTable(name = "product_images", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "image_url")
    private List<String> imageUrls;

    @OneToOne
    @JoinColumn(name = "tags_id")
    private Tags tags;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private User seller;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
