package com.example.backend.service;

import com.example.backend.dto.response.WalletTransactionResponse;
import com.example.backend.entity.User;
import com.example.backend.entity.Wallet;
import com.example.backend.entity.WalletTransaction;
import com.example.backend.enums.WalletTransactionType;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.WalletRepository;
import com.example.backend.repository.WalletTransactionRepository;
import com.example.backend.mapper.WalletTransactionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WalletTransactionService {
    private final WalletTransactionRepository walletTransactionRepository;
    private final WalletTransactionMapper walletTransactionMapper;
    private final WalletRepository  walletRepository;
    private final UserRepository userRepository;

    public List<WalletTransactionResponse> getAllWalletTransactions(){
        return walletTransactionMapper.toResponseList(walletTransactionRepository.findAll());
    }

    public List<WalletTransactionResponse> getAllWalletTransactionsRecharging(){
        return walletTransactionMapper.toResponseList(walletTransactionRepository.findByTypeWalletTraction(WalletTransactionType.RECHARGE));
    }

    public  List<WalletTransactionResponse>  getAllWalletTransactionsByUserID(long userid){

        Wallet wallet = walletRepository.findByUserId(userid)
                .orElseGet(() -> {
                    // Tạo wallet mới nếu chưa có
                    User user = userRepository.findById(userid)
                            .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
                    Wallet newWallet = Wallet.builder()
                            .user(user)
                            .balance(BigDecimal.ZERO)
                            .build();
                    return walletRepository.save(newWallet);
                });
        return walletTransactionMapper
                .toResponseList(walletTransactionRepository.findbyWalletid(wallet.getId()));
    }

}
