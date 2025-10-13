package com.example.backend.controller;

import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.response.TransactionHistoryResponse;
import com.example.backend.dto.response.WalletTransactionResponse;
import com.example.backend.service.TransactionService;
import com.example.backend.service.WalletTransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/admin")
public class ManageBalanceController {
    private final TransactionService transactionService;
    private final WalletTransactionService walletTransactionService;


    // xem duoc tien trong vi admin
    // lay cac giao dich nap tien
    // xem lich su giao dich cua 1 user cu the
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


}
