package com.example.backend.repository;

import com.example.backend.entity.Product;
import com.example.backend.entity.Vehicle;
import com.example.backend.enums.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

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

    List<Product> findAllBySellerId(Long id);

    @Query("select p from Product p where p.productType = 'VEHICLE' and p.vehicle.model = ?1 and p.vehicle.brand = ?2")
    List<Product> findByBrandAndModel(String model, String brand);


    // Tìm sản phẩm active để hiển thị
    @Query("SELECT p FROM Product p WHERE p.status = 'ACTIVE' ORDER BY p.createdAt DESC")
    Page<Product> findActiveProducts(Pageable pageable);



@Query(value = """
    select p.*,
    match(p.title, p.description)
    against(:keyword in natural language mode) as score
     from products p
   where match(p.title, p.description)
    against(:keyword in natural language mode)
    order by score desc

""",nativeQuery=true)

    List<Product> searchFullText(@Param("keyword") String keyword);


    Optional<Product> findProductByVehicle(Vehicle vehicle);
}
