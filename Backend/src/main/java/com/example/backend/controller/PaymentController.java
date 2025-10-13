package com.example.backend.controller;

import com.example.backend.config.Config;
import com.example.backend.dto.request.BuyPackageRequest;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.repository.query.Param;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
@Slf4j

public class PaymentController {
    private final PaymentService paymentService;
    // nap vao vi
    @PostMapping("/recharge")
    public ApiResponse<Map<String, Object>> createPayment(HttpServletRequest req, @RequestParam Long userId) {
        Map<String, Object> map = paymentService.generateLinkPayment(req, userId);
        return ApiResponse.<Map<String, Object>>builder().data(map).build();
    }
// mua goi
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






}

