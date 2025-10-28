package com.example.backend.repository;

import com.example.backend.entity.Order;
import com.example.backend.entity.Product;
import com.example.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRespository extends JpaRepository<Order, Long> {
        void deleteAllByProductAndSeller(Product product, User seller);
        List<Order> findAllByProductAndSellerAndIdNot(Product product, User seller, Long orderId);
        List<Order> findAllByProductIdAndSellerAcceptedFalse(Long productId);


        Order findByProductAndBuyer(Product product, User user);

        // Kiểm tra xem buyer đã mua hàng thành công từ seller chưa
        @Query("SELECT COUNT(o) > 0 FROM Order o " +
               "JOIN o.contracts c " +
               "WHERE o.buyer.id = :buyerId " +
               "AND o.seller.id = :sellerId " +
               "AND c.status = 'COMPLETED' " +
               "AND c.paymentCompleted = true " +
               "AND c.deliveryCompleted = true")
        boolean hasCompletedPurchase(@Param("buyerId") Long buyerId, @Param("sellerId") Long sellerId);

}
