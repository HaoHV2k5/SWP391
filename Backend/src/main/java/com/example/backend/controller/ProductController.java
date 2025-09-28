package com.example.backend.controller;

import com.example.backend.dto.request.CreateProductRequest;
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


    @PreAuthorize("hasAuthority('ROLE_SELLER')")
    @PostMapping("/create")
    public ApiResponse<ProductResponse> createProduct(@Valid @RequestBody CreateProductRequest createProductRequest, @RequestParam String username) {
        ProductResponse productResponse = productService.createProduct(createProductRequest, username);
        return ApiResponse.<ProductResponse>builder().message("Đã Tạo Product Thành Công").data(productResponse).build();

    }


    @GetMapping("/seller")
    public ApiResponse<List<ProductResponse>> sellerProducts(@RequestParam String username) {
        List<ProductResponse> list = productService.getProductsBySeller(username);
        return  ApiResponse.<List<ProductResponse>>builder()
                .message("lấy danh sách product của seller thành công")
                .data(list).build();

    }
    

}
