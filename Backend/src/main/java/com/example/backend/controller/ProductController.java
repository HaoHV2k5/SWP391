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
import org.springframework.http.MediaType;
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

//  tao tin dang
    @PreAuthorize("hasAuthority('ROLE_SELLER')")

    @PostMapping(value = "/create",consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<ProductResponse> createProduct(@Valid @ModelAttribute CreateProductRequest createProductRequest, @RequestParam String username) {
        ProductResponse productResponse = productService.createProduct(createProductRequest, username);
        return ApiResponse.<ProductResponse>builder().message("Đã Tạo Product Thành Công").data(productResponse).build();

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
    //xem thong tin chi tiet cua 1 san pham ===============================================
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
    // staff / admin reject product
    @PreAuthorize("hasAuthority('REJECT_POST')")
    @PostMapping("/{id}/reject")
    public ApiResponse<ProductResponse>  rejectProduct(@PathVariable Long id,@RequestBody ProductDecisionRequest request) {
            ProductResponse response = productService.rejectProduct(id,request.getReason());
            return ApiResponse.<ProductResponse>builder()
                    .data(response)
                    .message("Đã reject product thành công")
                    .build();
    }
// staff approve product
    @PreAuthorize("hasAuthority('ROLE_STAFF')")
    @PostMapping("/{id}/approve/staff")
    public ApiResponse<ProductResponse>  approveProductStaff(@PathVariable Long id) {
        ProductResponse response = productService.approveProductByStaff(id);
        return ApiResponse.<ProductResponse>builder()
                .data(response)
                .message("Đã approve product thành công bởi Staff")
                .build();
    }
// admi approve post
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")

    @PostMapping("/{id}/approve/admin")
    public ApiResponse<ProductResponse>  approveProductAdmin(@PathVariable Long id) {
        ProductResponse response = productService.approveProductByAdmin(id);
        return ApiResponse.<ProductResponse>builder()
                .data(response)
                .message("Đã approve product thành công bởi Admin")
                .build();
    }
    // seller lay cac san pham dc admin approve
    @PreAuthorize("hasAuthority('ROLE_SELLER')")
    @GetMapping("/seller/{id}")
    public ApiResponse<List<ProductResponse>> getProductApproveSeller(@PathVariable Long id) {
        List<ProductResponse> responses = productService.getApprovePostOfSeller(id);
        return ApiResponse.<List<ProductResponse>>builder()
                .data(responses)
                .message("lấy danh sách product được admin approve thành công")
                .build();

    }

    //seller lay cac bai dang reject cua minh

    @PreAuthorize("hasAuthority('ROLE_SELLER')")
    @GetMapping("/reject/seller/{id}")
    public ApiResponse<List<ProductResponse>> getProductRejectSeller(@PathVariable Long id) {
        List<ProductResponse> responses = productService.getRejectPostOfSeller(id);
        return ApiResponse.<List<ProductResponse>>builder()
                .data(responses)
                .message("lấy danh sách product bị reject của seller")
                .build();

    }

    // seller lay cac bai dang pending cua minh


    @PreAuthorize("hasAuthority('ROLE_SELLER')")
    @GetMapping("pending/seller/{id}")
    public ApiResponse<List<ProductResponse>> getProductPendingSeller(@PathVariable Long id) {
        List<ProductResponse> responses = productService.getPedingPostOfSeller(id);
        return ApiResponse.<List<ProductResponse>>builder()
                .data(responses)
                .message("lấy danh sách product pendig của seller")
                .build();

    }


    //seller lay tat ca  bai dang cua minh

    @PreAuthorize("hasAuthority('ROLE_SELLER')")
    @GetMapping("history/seller/{id}")
    public ApiResponse<List<ProductResponse>> getAllProductSeller(@PathVariable Long id) {
        List<ProductResponse> responses = productService.getAllPostOfSeller(id);
        return ApiResponse.<List<ProductResponse>>builder()
                .data(responses)
                .message("lấy danh sách tất cả product của seller")
                .build();

    }

    //lay danh sach cac san pham da dang ban của seller
    @GetMapping("/seller")
    public ApiResponse<List<ProductResponse>> sellerProductsPost(@RequestParam String username) {
        List<ProductResponse> list = productService.getProductsBySellerPost(username);
        return  ApiResponse.<List<ProductResponse>>builder()
                .message("lấy danh sách produc đăng bán")
                .data(list).build();

    }

    // seller chuyen bai dang sang trang thai public

    @PostMapping("/post/seller")
    public ApiResponse<ProductResponse> sellerProductsPost(@RequestParam Long productId) {
        ProductResponse response = productService.postProduct(productId);
        return  ApiResponse.<ProductResponse>builder()
                .message("chuyển bài đăng sang trạng thái public thành công")
                .data(response).build();

    }


}
