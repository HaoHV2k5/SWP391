package com.example.backend.controller;

import com.example.backend.dto.request.AddProductIntoWishlistRequest;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.entity.Product;
import com.example.backend.entity.Wishlist;
import com.example.backend.service.ProductService;
import com.example.backend.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/wishlist")
public class WishlistController {
    private final WishlistService wishlistService;
    private final ProductService productService;


    @PostMapping("/add")
    public ApiResponse<Boolean> addWishlist(@RequestBody AddProductIntoWishlistRequest request) {
        Product product = productService.getProduct(request.getProductId());
        boolean result = wishlistService.addProductIntoWishlist(product, request.getUserId());
        return ApiResponse.<Boolean>builder()
                .message("thêm product vào danh sách vỏ hàng thành công")
                .data(result)
                .build();
    }

}
