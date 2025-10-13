package com.example.backend.mapper;

import com.example.backend.dto.response.TransactionHistoryResponse;
import com.example.backend.entity.Transaction;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface TransactionMapper {
    @Mapping(target = "user", source = "user.id")
    @Mapping(target = "wallet", source = "wallet.id")
    TransactionHistoryResponse toTransactionHistoryResponse(Transaction transaction);

    List<TransactionHistoryResponse> toTransactionHistoryList(List<Transaction> transactions);
}
