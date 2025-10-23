package com.example.backend.controller;

import com.example.backend.dto.response.*;
import com.example.backend.service.TransactionService;
import com.example.backend.service.UserPackageTransactionService;
import com.example.backend.service.WalletService;
import com.example.backend.service.WalletTransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.repository.query.Param;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/admin")
public class ManageBalanceController {
    private final TransactionService transactionService;
    private final WalletTransactionService walletTransactionService;
    private final WalletService walletService;
    private final UserPackageTransactionService  userPackageTransactionService;



    // lay lich su mua goi
    @GetMapping("/transaction/history")
    public ApiResponse<List<TransactionHistoryResponse>> getTractions(){
        List<TransactionHistoryResponse> responses = transactionService.getTranction();
        return ApiResponse.<List<TransactionHistoryResponse>>builder()
                .data(responses)
                .message("lấy toàn bộ Transaction history thành công")
                .build();
    }
    // lay lich su toan bo bien dong so du

    @GetMapping("/wallettransactions")
    public ApiResponse<List<WalletTransactionResponse>> getAllWalletTransactions() {
        List<WalletTransactionResponse> responses = walletTransactionService.getAllWalletTransactions();
        return ApiResponse.<List<WalletTransactionResponse>>builder()
                .data(responses)
                .message("Lấy toàn bộ WalletTransaction thành công")
                .build();
    }
    // lay cac giao dich nap tien
    @GetMapping("/wallettransactions/recharge")
    public ApiResponse<List<WalletTransactionResponse>> getAllWalletTransactionsRecharge() {
        List<WalletTransactionResponse> responses = walletTransactionService.getAllWalletTransactionsRecharging();
        return ApiResponse.<List<WalletTransactionResponse>>builder()
                .data(responses)
                .message("Lấy toàn bộ WalletTransaction recharge thành công")
                .build();
    }

    // xem duoc tien trong vi admin
    @GetMapping("/balance")
    public ApiResponse<BigDecimal> getAdminBalance() {
        BigDecimal balance = walletService.getBalanceAdmin();
        return ApiResponse.<BigDecimal>builder()
                .data(balance)
                .message("xem số tiền trong ví admin thành công")
                .build();
    }

    // xem lich su giao dong cua so du trong vi  cua 1 user cu the
    @GetMapping("/user/walletTransaction")
    public ApiResponse<List<WalletTransactionResponse>> getWalletTransactionByUserID(@RequestParam Long userId){
        List<WalletTransactionResponse> responses = walletTransactionService.getAllWalletTransactionsByUserID(userId);
        return ApiResponse.<List<WalletTransactionResponse>>builder()
                .data(responses)
                .message("lấy danh sách wallet transactions của user thành công ")
                .build();
    }
    // xem lich su mua goi  cua 1 user cu the
    @GetMapping("/user/transaction")
    public ApiResponse<List<TransactionHistoryResponse>> getTransactionUserid(@RequestParam Long userId){
        List<TransactionHistoryResponse> responses = transactionService.getTranctionByUserid(userId);
        return ApiResponse.<List<TransactionHistoryResponse>>builder()
                .data(responses)
                .message("lấy danh sách  transactions của user thành công ")
                .build();
    }

    // xem cac goi ma user da mua

    @GetMapping("/user/transaction/package")
    public ApiResponse<List<PackageBuyHistoryResponse>> getTransactionPackageUserid(@RequestParam Long userId){
        List<PackageBuyHistoryResponse> responses = userPackageTransactionService.getUserPackageTransactions(userId);
        return ApiResponse.< List<PackageBuyHistoryResponse>>builder()
                .data(responses)
                .message("lấy danh sách gói mà user đã mua thành công ")
                .build();
    }



}
