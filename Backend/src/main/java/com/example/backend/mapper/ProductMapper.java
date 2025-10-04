package com.example.backend.mapper;

import com.example.backend.dto.request.CreateProductRequest;
import com.example.backend.dto.response.ProductResponse;
import com.example.backend.entity.Product;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring", uses = {VehicleMapper.class, BatteryMapper.class})
public interface ProductMapper {
    @Mapping(target = "vehicle", source = "vehicle")
    @Mapping(target = "battery", source = "battery")
    Product toProduct(CreateProductRequest createProductRequest);
    
    @Mapping(target = "sellerId", source = "seller.id")
    @Mapping(target = "sellerName", source = "seller.fullname")
    @Mapping(target = "reason", source = "reason")
    @Mapping(target = "vehicle", source = "vehicle")
    @Mapping(target = "battery", source = "battery")
    ProductResponse toProductResponse(Product product);

    List<ProductResponse> toResponseList(List<Product> products);
}

