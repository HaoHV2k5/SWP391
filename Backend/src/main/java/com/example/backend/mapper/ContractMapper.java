package com.example.backend.mapper;

import com.example.backend.dto.response.ContractResponse;
import com.example.backend.entity.Contract;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import java.util.List;

@Mapper(componentModel = "spring")
public interface ContractMapper {
    @Mapping(target = "buyerId", source = "buyer.id")
    @Mapping(target = "buyerName", source = "buyer.fullname")
    @Mapping(target = "sellerId", source = "seller.id")
    @Mapping(target = "sellerName", source = "seller.fullname")
    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "productName", source = "product.title")
    @Mapping(target = "orderId", source = "order.id")
    ContractResponse toContractResponse(Contract contract);
    List<ContractResponse> toContractResponseList(List<Contract> contracts);
}
