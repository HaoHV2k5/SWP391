package com.example.backend.mapper;

import com.example.backend.dto.response.ComplaintResponse;
import com.example.backend.entity.Complaint;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ComplaintMapper {
    
    @Mapping(target = "buyerId", source = "buyer.id")
    @Mapping(target = "buyerName", source = "buyer.fullname")
    @Mapping(target = "buyerEmail", source = "buyer.email")
    @Mapping(target = "sellerId", source = "seller.id")
    @Mapping(target = "sellerName", source = "seller.fullname")
    @Mapping(target = "sellerEmail", source = "seller.email")
    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "productTitle", source = "product.title")
    @Mapping(target = "contractId", source = "contract.id")
    @Mapping(target = "contractCode", source = "contract.contractCode")
    ComplaintResponse toComplaintResponse(Complaint complaint);
    
    List<ComplaintResponse> toComplaintResponseList(List<Complaint> complaints);
}
