package com.example.backend.service;

import com.example.backend.dto.response.UserPackageTransactionResponse;
import com.example.backend.entity.UserPostingPackage;
import com.example.backend.mapper.UserPackageTransactionMapper;
import com.example.backend.repository.UserPackageTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserPackageTransactionService {

    private final UserPackageTransactionRepository userPackageTransactionRepository;
    private final UserPackageTransactionMapper  userPackageTransactionMapper;
    public List<UserPackageTransactionResponse> getUserPackageTransactions(Long userId){
        List<UserPostingPackage> list = userPackageTransactionRepository.findByUserId(userId);
        return userPackageTransactionMapper.toUserPackageTransactionResponsesList(list);
    }


}
