package com.example.backend.controller;

import com.example.backend.dto.request.CreateProductRequest;
import com.example.backend.dto.request.ProductDecisionRequest;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.response.ProductResponse;
import com.example.backend.enums.ProductStatus;
import com.example.backend.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("products")
@Slf4j

public class ProductController {
    
    private final ProductService productService;

// dang tin ban
    @PreAuthorize("hasAuthority('ROLE_SELLER')")
    @PostMapping("/create")
    public ApiResponse<ProductResponse> createProduct(@Valid @RequestBody CreateProductRequest createProductRequest, @RequestParam String username) {
        ProductResponse productResponse = productService.createProduct(createProductRequest, username);
        return ApiResponse.<ProductResponse>builder().message("Đã Tạo Product Thành Công").data(productResponse).build();

    }

    //lay danh sach cac san pham da dang ban
    @GetMapping("/seller")
    public ApiResponse<List<ProductResponse>> sellerProductsPost(@RequestParam String username) {
        List<ProductResponse> list = productService.getProductsBySellerPost(username);
        return  ApiResponse.<List<ProductResponse>>builder()
                .message("lấy danh sách product của seller thành công")
                .data(list).build();

    }
    // staff lay cac product pending
    @PreAuthorize("hasAuthority('ROLE_STAFF')")
    @GetMapping("/pending/seller/staff")
    public ApiResponse<List<ProductResponse>> getProductsStaff() {
        List<ProductResponse> list = productService.getPendingProducts();
        return  ApiResponse.<List<ProductResponse>>builder()
                .message("lấy danh sách product pending thành công")
                .data(list).build();

    }
    //xem thong tin chi tiet cua 1 san pham
    @GetMapping("/{id}")
    public ApiResponse<ProductResponse> getDetailInfoProductById(@PathVariable Long id) {
        ProductResponse response = productService.getProductById(id);
        return  ApiResponse.<ProductResponse>builder()
                .data(response)
                .message("lấy thông tin chi tiết product thành công")
                .build();
    }


    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    // lay cac bai dang staff_approve cho admin
    @GetMapping("/seller/staff_approved/admin")
    public ApiResponse<List<ProductResponse>> getProductsAdmin() {
        List<ProductResponse> responses = productService.getPostApproveByStaff();
        return  ApiResponse.<List<ProductResponse>>builder()
                .data(responses)
                .message("lấy các bài đăng staff_approved thành công")
                .build();
    }
    @PreAuthorize("hasAuthority('REJECT_POST')")
    @PostMapping("/{id}/reject")
    public ApiResponse<ProductResponse>  rejectProduct(@PathVariable Long id,@RequestBody ProductDecisionRequest request) {
            ProductResponse response = productService.rejectProduct(id,request.getReason());
            return ApiResponse.<ProductResponse>builder()
                    .data(response)
                    .message("Đã reject product thành công")
                    .build();
    }

    @PreAuthorize("hasAuthority('ROLE_STAFF')")
    @PostMapping("/{id}/approve/staff")
    public ApiResponse<ProductResponse>  approveProductStaff(@PathVariable Long id) {
        ProductResponse response = productService.approveProductByStaff(id);
        return ApiResponse.<ProductResponse>builder()
                .data(response)
                .message("Đã approve product thành công bởi Staff")
                .build();
    }

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")

    @PostMapping("/{id}/approve/admin")
    public ApiResponse<ProductResponse>  approveProductAdmin(@PathVariable Long id) {
        ProductResponse response = productService.approveProductByAdmin(id);
        return ApiResponse.<ProductResponse>builder()
                .data(response)
                .message("Đã approve product thành công bởi Admin")
                .build();
    }



}
