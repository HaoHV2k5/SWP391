package com.example.backend.service;

import com.example.backend.dto.response.PackageBuyHistoryResponse;
import com.example.backend.dto.response.UserPackageTransactionResponse;
import com.example.backend.entity.PostingPackage;
import com.example.backend.entity.UserPostingPackage;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.UserPackageTransactionMapper;
import com.example.backend.repository.PostingPackageRepository;
import com.example.backend.repository.UserPackageTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserPackageTransactionService {

    private final UserPackageTransactionRepository userPackageTransactionRepository;
    private final UserPackageTransactionMapper  userPackageTransactionMapper;
    private final PostingPackageRepository postingPackageRepository;

    public List<PackageBuyHistoryResponse> getUserPackageTransactions(Long userId){
        List<UserPostingPackage> list = userPackageTransactionRepository.findByUserId(userId);
        return userPackageTransactionMapper.toPackageBuyHistoryResponsesList(list);
    }
    // lay goi tin ma nguoi ban mua
    public UserPostingPackage getUserPostingPackageByUserId(Long userId){
        UserPostingPackage userPosingPackage = userPackageTransactionRepository.findPostingPackageByUserIdAndActiveTrue(userId);
        // Trả về null thay vì throw exception nếu user chưa mua gói
        return userPosingPackage;
    }


}
