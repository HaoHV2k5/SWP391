package com.example.backend.mapper;

import com.example.backend.dto.request.CreateProductRequest;
import com.example.backend.dto.response.ProductResponse;
import com.example.backend.entity.Product;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ProductMapper {
    
    ProductMapper INSTANCE = Mappers.getMapper(ProductMapper.class);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "seller", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "imageUrls", expression = "java(convertListToString(request.getImageUrls()))")
    Product toEntity(CreateProductRequest request);
    
    @Mapping(target = "sellerId", source = "seller.id")
    @Mapping(target = "sellerName", source = "seller.fullname")
    @Mapping(target = "imageUrls", expression = "java(convertStringToList(product.getImageUrls()))")
    ProductResponse toResponse(Product product);
    
    List<ProductResponse> toResponseList(List<Product> products);
    
    default String convertListToString(List<String> imageUrls) {
        if (imageUrls == null || imageUrls.isEmpty()) {
            return null;
        }
        return String.join(",", imageUrls);
    }
    
    default List<String> convertStringToList(String imageUrls) {
        if (imageUrls == null || imageUrls.isEmpty()) {
            return List.of();
        }
        return List.of(imageUrls.split(","));
    }
}

