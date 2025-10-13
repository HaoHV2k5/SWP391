package com.example.backend.service;

import com.example.backend.dto.response.WalletTransactionResponse;
import com.example.backend.entity.WalletTransaction;
import com.example.backend.repository.WalletTransactionRepository;
import com.example.backend.mapper.WalletTransactionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WalletTransactionService {
    private final WalletTransactionRepository walletTransactionRepository;
    private final WalletTransactionMapper walletTransactionMapper;


    public List<WalletTransactionResponse> getAllWalletTransactions(){
        return walletTransactionMapper.toResponseList(walletTransactionRepository.findAll());
    }

}
