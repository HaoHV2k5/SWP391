package com.example.backend.controller;

import com.example.backend.config.Config;
import com.example.backend.dto.request.BuyPackageRequest;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.response.TransactionHistoryResponse;
import com.example.backend.entity.User;
import com.example.backend.entity.Wallet;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.WalletRepository;
import com.example.backend.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.repository.query.Param;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.math.BigDecimal;
import java.util.Map;
import java.util.*;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
@Slf4j

public class PaymentController {
    private final PaymentService paymentService;
    private final UserRepository userRepository;
    private final WalletRepository walletRepository;

    // mua goi
@PreAuthorize("hasAuthority('ROLE_SELLER')")
    @PostMapping("/buy-package")
    public ApiResponse<Boolean> buyPackage(@RequestBody BuyPackageRequest request) {
       boolean ans = paymentService.handleBuyTransaction(request.getUserId(),request.getPackageId());
       String mess = ans? "mua thành công" : "mua thất bại! không đủ tiền trong ví";
       return ApiResponse.<Boolean>builder().data(ans).message(mess).build();
    }

    @GetMapping("/payment-return")
    public ResponseEntity<String> handleVnpayReturn(HttpServletRequest request) {
        String result = paymentService.vnpReturn(request);
        return ResponseEntity.ok(result);
    }



    //    @GetMapping("/payment-return")
//    public Map<String, Object> testReturn(HttpServletRequest request) {
//        Map<String, Object> response = new HashMap<>();
//        response.put("message", "Đã nhận callback từ VNPAY");
//        response.put("params", request.getParameterMap()); // in ra hết param callback
//        return response;
//    }
    @GetMapping("/callback")
    public ResponseEntity<Map<String, String>> handleVnpayIpn(@RequestParam Map<String, String> requestParams) {
        log.warn("đã callback");
        Map<String, String> response = paymentService.handleVnpayIpn(requestParams);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/test")
    public ApiResponse<String> test() {
        return ApiResponse.<String>builder().data("Payment API is working").build();
    }

    @GetMapping("/simple-test")
    public String simpleTest() {
        return "Simple test endpoint working";
    }

    @PostMapping("/create-wallet")
    public ApiResponse<String> createWallet(@RequestParam Long userId) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
            
            // Kiểm tra xem user đã có wallet chưa
            if (walletRepository.findByUserId(userId).isPresent()) {
                return ApiResponse.<String>builder()
                        .data("User đã có wallet")
                        .message("Wallet đã tồn tại")
                        .build();
            }
            
            // Tạo wallet mới
            Wallet wallet = Wallet.builder()
                    .user(user)
                    .balance(BigDecimal.ZERO)
                    .build();
            walletRepository.save(wallet);
            
            return ApiResponse.<String>builder()
                    .data("Wallet created successfully")
                    .message("Tạo wallet thành công")
                    .build();
        } catch (Exception e) {
            return ApiResponse.<String>builder()
                    .data("Error: " + e.getMessage())
                    .message("Lỗi khi tạo wallet")
                    .build();
        }
    }

    @PostMapping("/recharge")
    public ApiResponse<String> recharge(@RequestBody Map<String, Object> request, Authentication authentication) {
        try {
            String username = authentication.getName();
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
            
            BigDecimal amount = BigDecimal.valueOf(((Number) request.get("amount")).doubleValue());
            String orderInfo = (String) request.get("orderInfo");
            String orderType = (String) request.get("orderType");
            
            // Tạo wallet nếu chưa có
            Wallet wallet = walletRepository.findByUserId(user.getId())
                    .orElseGet(() -> {
                        Wallet newWallet = Wallet.builder()
                                .user(user)
                                .balance(BigDecimal.ZERO)
                                .build();
                        return walletRepository.save(newWallet);
                    });
            
            // Tạo link thanh toán VNPay
            String paymentUrl = paymentService.generateLinkPayment(
                amount.intValue(),
                orderInfo != null ? orderInfo : "Nạp tiền vào ví",
                orderType != null ? orderType : "recharge",
                user.getId()
            );
            
            return ApiResponse.<String>builder()
                    .data(paymentUrl)
                    .message("Tạo link thanh toán thành công")
                    .build();
        } catch (Exception e) {
            return ApiResponse.<String>builder()
                    .data("Error: " + e.getMessage())
                    .message("Lỗi khi tạo link thanh toán")
                    .build();
        }
    }
}