package com.example.backend.service;

import com.example.backend.dto.request.CreateProductRequest;
import com.example.backend.dto.response.ProductResponse;
import com.example.backend.entity.Product;
import com.example.backend.entity.User;
import com.example.backend.enums.ProductStatus;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.ProductMapper;
import com.example.backend.repository.ProductRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {
    
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ProductMapper productMapper;
    
    @Transactional
    public ProductResponse createProduct(CreateProductRequest request, String username) {
        // Tìm user theo username
        User seller = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        // Tạo product entity
        Product product = productMapper.toProduct(request);
        product.setSeller(seller);
        // Lưu product
        Product savedProduct = productRepository.save(product);
        
        return productMapper.toProductResponse(savedProduct);
    }
    
//    public List<ProductResponse> getProductsBySeller(String username) {
//        User seller = userRepository.findByUsername(username)
//                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
//
//        List<Product> products = productRepository.findBySellerId(seller.getId());
//        return productMapper.toResponseList(products);
//    }
    
//    public List<ProductResponse> getPendingProducts() {
//        List<Product> products = productRepository.findPendingProducts();
//        return productMapper.toResponseList(products);
//    }
    
//    public Page<ProductResponse> getActiveProducts(Pageable pageable) {
//        Page<Product> products = productRepository.findActiveProducts(pageable);
//        return products.map(productMapper::toResponse);
//    }
    
//    public ProductResponse getProductById(Long id) {
//        Product product = productRepository.findById(id)
//                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
//        return productMapper.toResponse(product);
//    }
    
//    @Transactional
//    public ProductResponse updateProductStatus(Long id, ProductStatus status) {
//        Product product = productRepository.findById(id)
//                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
//
//        product.setStatus(status);
//        Product updatedProduct = productRepository.save(product);
//
//        return productMapper.toResponse(updatedProduct);
//    }
}
