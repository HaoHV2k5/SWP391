package com.example.backend.repository;

import com.example.backend.entity.Product;
import com.example.backend.enums.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    // Tìm sản phẩm theo seller
    List<Product> findBySellerId(Long sellerId);
    
    // Tìm sản phẩm theo status
    Page<Product> findByStatus(ProductStatus status, Pageable pageable);

    // Tìm sản phẩm theo seller và status
    List<Product> findBySellerIdAndIsPostedTrue(Long sellerId);
    List<Product> findBySellerIdAndStatus(Long sellerId, ProductStatus status);
    // Tìm sản phẩm đang pending
    @Query("SELECT p FROM Product p WHERE p.status = 'PENDING' ORDER BY p.createdAt DESC")
    List<Product> findPendingProducts();
    // tim san pham dan staff_approve
    @Query("SELECT p FROM Product p WHERE p.status = 'STAFF_APPROVED' ORDER BY p.createdAt DESC")
    List<Product> findStaffApproveProducts();



    // Tìm sản phẩm active để hiển thị
    @Query("SELECT p FROM Product p WHERE p.status = 'ACTIVE' ORDER BY p.createdAt DESC")
    Page<Product> findActiveProducts(Pageable pageable);
}
