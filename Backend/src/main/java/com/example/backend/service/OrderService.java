package com.example.backend.service;

import com.example.backend.dto.request.BuyProductRequest;
import com.example.backend.dto.response.OrderResponse;
import com.example.backend.entity.Order;
import com.example.backend.entity.Product;
import com.example.backend.entity.User;
import com.example.backend.mapper.OrderMapper;
import com.example.backend.repository.OrderRespository;
import com.example.backend.repository.ProductRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderRespository orderRespository;
    private final OrderMapper orderMapper;


    public OrderResponse buyOrder(BuyProductRequest request){
        Product product = productRepository.findById(request.getProductId()).get();
        User user = userRepository.findById(request.getUserId()).get();
        Order order = Order.builder()
                .createdAt(LocalDateTime.now())
                .product(product)
                .buyer(user)
                .seller(product.getSeller())
                .offeredPrice(product.getPrice())
                .message("Order has been submitted")
                .build();
        product.setPosted(false);
        productRepository.save(product);
        orderRespository.save(order);
        return  orderMapper.toOrderResponse(order);
    }

}
