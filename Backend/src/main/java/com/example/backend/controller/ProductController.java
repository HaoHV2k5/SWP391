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
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/products")
@Slf4j
@Tag(name = "Product Management", description = "APIs for managing products")
public class ProductController {
    
    private final ProductService productService;
    
    @PostMapping
    @Operation(
        summary = "Create a new product listing",
        description = "Create a new product listing. Only users with SELL_PRODUCT permission can create products. Products are created with PENDING status.",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(
            @RequestBody @Valid CreateProductRequest request,
            Authentication authentication) {
        
        String username = authentication.getName();
        log.info("Creating product for user: {}", username);
        
        ProductResponse product = productService.createProduct(request, username);
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<ProductResponse>builder()
                        .message("Product created successfully and is pending approval")
                        .data(product)
                        .build());
    }
    
    @GetMapping("/my-products")
    @Operation(
        summary = "Get current user's products",
        description = "Get all products created by the current authenticated user",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getMyProducts(
            Authentication authentication) {
        
        String username = authentication.getName();
        log.info("Getting products for user: {}", username);
        
        List<ProductResponse> products = productService.getProductsBySeller(username);
        
        return ResponseEntity.ok(ApiResponse.<List<ProductResponse>>builder()
                .message("Products retrieved successfully")
                .data(products)
                .build());
    }
    
    @GetMapping("/active")
    @Operation(
        summary = "Get active products",
        description = "Get all active products with pagination"
    )
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> getActiveProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        log.info("Getting active products - page: {}, size: {}", page, size);
        
        Pageable pageable = PageRequest.of(page, size);
        Page<ProductResponse> products = productService.getActiveProducts(pageable);
        
        return ResponseEntity.ok(ApiResponse.<Page<ProductResponse>>builder()
                .message("Active products retrieved successfully")
                .data(products)
                .build());
    }
    
    @GetMapping("/{id}")
    @Operation(
        summary = "Get product by ID",
        description = "Get a specific product by its ID"
    )
    public ResponseEntity<ApiResponse<ProductResponse>> getProductById(@PathVariable Long id) {
        
        log.info("Getting product with ID: {}", id);
        
        ProductResponse product = productService.getProductById(id);
        
        return ResponseEntity.ok(ApiResponse.<ProductResponse>builder()
                .message("Product retrieved successfully")
                .data(product)
                .build());
    }
    
    @GetMapping("/admin/pending")
    @Operation(
        summary = "Get pending products (Admin only)",
        description = "Get all products with PENDING status for admin review",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getPendingProducts(
            Authentication authentication) {
        
        log.info("Getting pending products for admin: {}", authentication.getName());
        
        List<ProductResponse> products = productService.getPendingProducts();
        
        return ResponseEntity.ok(ApiResponse.<List<ProductResponse>>builder()
                .message("Pending products retrieved successfully")
                .data(products)
                .build());
    }
    
    @PutMapping("/admin/{id}/status")
    @Operation(
        summary = "Update product status (Admin only)",
        description = "Update the status of a product (APPROVE/REJECT)",
        security = @SecurityRequirement(name = "bearerAuth")
    )
    public ResponseEntity<ApiResponse<ProductResponse>> updateProductStatus(
            @PathVariable Long id,
            @RequestParam ProductStatus status,
            Authentication authentication) {
        
        log.info("Updating product {} status to {} by admin: {}", id, status, authentication.getName());
        
        ProductResponse product = productService.updateProductStatus(id, status);
        
        return ResponseEntity.ok(ApiResponse.<ProductResponse>builder()
                .message("Product status updated successfully")
                .data(product)
                .build());
    }
}
