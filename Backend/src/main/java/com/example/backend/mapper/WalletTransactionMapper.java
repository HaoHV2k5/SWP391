package com.example.backend.mapper;

import com.example.backend.dto.response.WalletTransactionResponse;
import com.example.backend.entity.WalletTransaction;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface WalletTransactionMapper {
    WalletTransactionResponse toResponse(WalletTransaction entity);
    List<WalletTransactionResponse> toResponseList(List<WalletTransaction> entities);
}
