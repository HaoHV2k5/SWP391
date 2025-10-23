package com.example.backend.controller;

import com.example.backend.dto.request.BuyProductRequest;
import com.example.backend.dto.request.RejectOrderRequest;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.response.OrderResponse;
import com.example.backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/order")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;
    @PreAuthorize("hasAuthority('ROLE_USER')")
    @PostMapping("/create")
    public ApiResponse<OrderResponse> buyProduct(@RequestBody BuyProductRequest request) {
        OrderResponse order =orderService.buyOrder(request);
        return  ApiResponse.<OrderResponse>builder().data(order)
                .message("đã gửi yêu cầu mua sản phẩm tới ngươ bán")
                .build();

    }

    @PostMapping("/reject")
    public ApiResponse<Void> rejectOrder(@RequestParam Long orderId) {
        orderService.rejectOrder(orderId);
        return ApiResponse.<Void>builder().message("đã từ chối order request thành công").build();
    }

}
