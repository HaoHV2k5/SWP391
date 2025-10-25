package com.example.backend.repository;

import com.example.backend.entity.Order;
import com.example.backend.entity.Product;
import com.example.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRespository extends JpaRepository<Order, Long> {
        void deleteAllByProductAndSeller(Product product, User seller);
        List<Order> findAllByProductAndSellerAndIdNot(Product product, User seller, Long orderId);
        List<Order> findAllByProductIdAndSellerAcceptedFalse(Long productId);


        Order findByProductAndBuyer(Product product, User user);

}
