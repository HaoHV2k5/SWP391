package com.example.backend.controller;

import com.example.backend.dto.request.BuyProductRequest;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.response.OrderResponse;
import com.example.backend.dto.response.ProductResponseStaff;
import com.example.backend.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import com.example.backend.dto.request.OrderReviewRequest;

@RestController
@RequestMapping("/order")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;
    private final com.example.backend.service.ConstractService constractService;
    @PreAuthorize("hasAnyAuthority('ROLE_USER','ROLE_SELLER')")
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

    @PreAuthorize("hasAuthority('ROLE_SELLER')")
    @GetMapping("/product/{productId}/orders")
    public ApiResponse<List<OrderResponse>> getOrdersByProduct(@PathVariable Long productId) {
        List<OrderResponse> orders = orderService.getOrdersByProductId(productId);
        return ApiResponse.<List<OrderResponse>>builder().data(orders).message("Lấy danh sách order cho sản phẩm thành công").build();
    }

//    @PreAuthorize("hasAuthority('ROLE_USER')")
    @PostMapping("/confirm-received")
    public ApiResponse<Void> confirmReceived(@RequestParam Long orderId) {
        // lấy userId từ context (giả sử có method getCurrentUserId())

        constractService.handleBuyerConfirmReceived(orderId);
        return ApiResponse.<Void>builder().message("Xác nhận đã nhận hàng thành công").build();
    }

//    @PreAuthorize("hasAuthority('ROLE_SELLER')")
    @PostMapping("/request-complete")
    public ApiResponse<Void> requestOrderAdminReview(@ModelAttribute OrderReviewRequest request) {
        orderService.sellerRequestAdminReview(request);
        return ApiResponse.<Void>builder().message("Đã gửi yêu cầu xác nhận tới admin").build();
    }

        @PreAuthorize("hasAnyAuthority('ROLE_USER','ROLE_SELLER')")
    @GetMapping("/get-ordered/{buyerId}")
    public ApiResponse<List<OrderResponse>> getOrderedByBuyerId(@PathVariable Long buyerId) {
        List<OrderResponse> list = orderService.getOrdersByBuyerId(buyerId);
        return ApiResponse.<List<OrderResponse>>builder()
                .message("Lấy danh sách đơn hàng thành công")
                .data(list)
                .build();
    }
}
