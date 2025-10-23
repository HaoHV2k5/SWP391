package com.example.backend.controller;

import java.util.Map;
import java.util.HashMap;
import java.lang.reflect.Field;

import com.example.backend.dto.response.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;

import com.example.backend.service.EversignService;
import com.example.backend.dto.request.ContractCreateTemplateRequest;

import lombok.RequiredArgsConstructor;

@Slf4j
@RestController
@RequestMapping("/api/eversign")
@RequiredArgsConstructor
public class ContractController {


    private final EversignService eversignService;

    // Endpoint duy nhất: tạo hợp đồng dùng template eversign
    @PostMapping("/create-using-template")
    public ApiResponse<Map<String, Object>> createContractWithTemplate(@RequestBody ContractCreateTemplateRequest request) {
        Map<String, Object> map = eversignService.createDocumentUsingTemplate(request);
        return ApiResponse.<Map<String, Object>>builder().message("đã tạo hợp đồng thành công").data(map).build();
    }

    // handle eversign callback ve (webhook)

    @PostMapping("/webhook")
    public ApiResponse<String> handleWebHook(@RequestBody Map<String, Object> payload) {

        boolean check = eversignService.handleWebHook(payload);
        String result = check ? "buid true" : "buid false";
        return ApiResponse.<String>builder().message(result).build();

    }


}
