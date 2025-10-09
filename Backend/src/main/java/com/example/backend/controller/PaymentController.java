package com.example.backend.controller;

import com.example.backend.config.Config;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor

public class PaymentController {
    private final PaymentService paymentService;
    @PostMapping("/create")
    public ApiResponse<Map<String,Object>> createPayment(HttpServletRequest req) {
        Map<String,Object> map = paymentService.generateLinkPayment(req);
        return  ApiResponse.<Map<String, Object>>builder().data(map).build();
    }

    @GetMapping("/vnpay-return000000")
    public ApiResponse<String> handleVnpayReturn(HttpServletRequest request) {
       String result = paymentService.vnpReturn(request);
       return ApiResponse.<String>builder().data(result).build();
    }


    @GetMapping("/payment-return")
    public Map<String, Object> testReturn(HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Đã nhận callback từ VNPAY");
        response.put("params", request.getParameterMap()); // in ra hết param callback
        return response;
    }





}

