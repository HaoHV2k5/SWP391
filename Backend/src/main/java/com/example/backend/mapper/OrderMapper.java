package com.example.backend.mapper;

import com.example.backend.dto.response.OrderResponse;
import com.example.backend.dto.response.OrderEscrowReviewResponse;
import com.example.backend.entity.Order;
import com.example.backend.entity.OrderEscrow;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface OrderMapper {


    @Mapping(source = "buyer.id", target = "buyerId")
    @Mapping(source = "buyer.fullname", target = "buyerName")
    @Mapping(source = "seller.id", target = "sellerId")
    @Mapping(source = "seller.fullname", target = "sellerName")
    @Mapping(source = "product.id", target = "productId")
    @Mapping(source = "product.title", target = "productName")
    OrderResponse toOrderResponse(Order order);

    @Mapping(source = "order.id", target = "orderId")
    @Mapping(source = "sellerProofImage", target = "sellerProofImage")
    @Mapping(source = "sellerOrderCode", target = "sellerOrderCode")
    @Mapping(source = "order.seller.id", target = "sellerId")
    OrderEscrowReviewResponse toEscrowReviewResponse(OrderEscrow escrow);

}
