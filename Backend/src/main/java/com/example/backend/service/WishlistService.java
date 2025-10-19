package com.example.backend.service;

import com.example.backend.dto.response.ProductResponse;
import com.example.backend.entity.Product;
import com.example.backend.entity.User;
import com.example.backend.entity.Wishlist;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.ProductMapper;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class WishlistService {
    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;
    private final ProductMapper productMapper;
    public boolean addProductIntoWishlist(Product product, Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        Wishlist wishlist = wishlistRepository.findByUser(user);
        if (wishlist == null) {
            throw new AppException(ErrorCode.WISHLIST_NOT_EXISTED);
        }
        Set<Product> list = wishlist.getProducts();
        list.add(product);
        wishlist.setProducts(list);
        wishlistRepository.save(wishlist);
        return true;

    }

    public List<ProductResponse> getAllProductsInWishlist(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        Wishlist wishlist = wishlistRepository.findByUser(user);
        if (wishlist == null) {
            throw new AppException(ErrorCode.WISHLIST_NOT_EXISTED);
        }
        Set<Product> setProduct = wishlist.getProducts();
        List<Product> listProduct = new ArrayList<>(setProduct);
        return productMapper.toResponseList(listProduct);

    }


}
