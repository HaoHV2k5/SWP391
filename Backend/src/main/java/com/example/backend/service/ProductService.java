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
    // lay product da duoc seller dang tin
    public List<ProductResponse> getProductsBySellerPost(String username) {
        User seller = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        List<Product> products = productRepository.findBySellerIdAndIsPostedTrue(seller.getId());
        return productMapper.toResponseList(products);
    }
    // lay cac san pham pending staff
    public List<ProductResponse> getPendingProducts() {
        List<Product> products = productRepository.findPendingProducts();
        return productMapper.toResponseList(products);
    }
    // tu choi post boi admin va staff
    public ProductResponse rejectProduct(Long id,  String reason) {
        Product product = productRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        product.setStatus(ProductStatus.REJECTED);
        product.setReason(reason);
        Product saved = productRepository.save(product);
        return productMapper.toProductResponse(saved);
    }
    // chap nhan post boi staff
    public ProductResponse approveProductByStaff(Long id){
        Product product = productRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        product.setStatus(ProductStatus.STAFF_APPROVED);
        product.setReason(null);
        productRepository.save(product);
        return productMapper.toProductResponse(product);
    }
// chap nhan post boi admin
    public ProductResponse approveProductByAdmin(Long id){
        Product product = productRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        product.setStatus(ProductStatus.ADMIN_APPROVED);
        product.setReason(null);
        productRepository.save(product);
        return productMapper.toProductResponse(product);


    }


// lay danh sach post duoc staff approve cho admin
    public List<ProductResponse> getPostApproveByStaff(){
        List<Product> list = productRepository.findStaffApproveProducts();
        return productMapper.toResponseList(list);
    }




    // xem chi tiet thong tin san pham
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        return productMapper.toProductResponse(product);
    }


    // seller post bai dang

    //seller lay cac bai dang  duoc admin approve cua minh
    public List<ProductResponse> getApprovePostOfSeller(Long id){
        List<Product> list =productRepository.findBySellerIdAndStatus(id, ProductStatus.ADMIN_APPROVED);
        return productMapper.toResponseList(list);
    }
    // seller lay tat ca bai cua minh da gui len staff/admin de kiem

    // seller lay cac bai bi reject cua minh

    // seller lay cac bai pending cua minh














}
