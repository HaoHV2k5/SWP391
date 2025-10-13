package com.example.backend.service;

import com.example.backend.dto.response.TransactionHistoryResponse;
import com.example.backend.entity.Transaction;
import com.example.backend.mapper.TransactionMapper;
import com.example.backend.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TransactionService {
    private final TransactionMapper transactionMapper;
    private final TransactionRepository transactionRepository;


    public List<TransactionHistoryResponse> getTranction(){
        List<Transaction> responses = transactionRepository.findAll();
        return transactionMapper.toTransactionHistoryList(responses);
    }

    public List<TransactionHistoryResponse> getTranctionByUserid(Long userId){
        List<Transaction> responses = transactionRepository.findByUserId(userId);
        return transactionMapper.toTransactionHistoryList(responses);
    }

}
