package com.example.backend.controller;

import com.example.backend.dto.request.AddProductIntoWishlistRequest;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.response.ProductResponse;
import com.example.backend.entity.Product;
import com.example.backend.entity.Wishlist;
import com.example.backend.service.ProductService;
import com.example.backend.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @GetMapping
    public ApiResponse<List<ProductResponse>> getWishlist(@RequestParam Long userId){
        List<ProductResponse> list = wishlistService.getAllProductsInWishlist(userId);
        return ApiResponse.<List<ProductResponse>>builder()
                .data(list)
                .message("Đã lấy toàn bộ sản phẩm trong wishlist thành công!")
                .build();
    }

    @DeleteMapping("/delete")
    public  ApiResponse<Void> deleteWishlist(@RequestParam Long productId, @RequestParam Long userId){
        Product product = productService.getProduct(productId);
        wishlistService.deleteProductFromWishlist(product,userId );
        return ApiResponse.<Void>builder().message("Đã xóa product khỏi wishlist").build();
    }

}
