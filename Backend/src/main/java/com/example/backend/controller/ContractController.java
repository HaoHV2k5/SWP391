package com.example.backend.controller;

import java.util.Map;
import java.util.HashMap;
import java.lang.reflect.Field;
import java.util.List;

import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.response.ContractResponse;
import com.example.backend.service.ConstractService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.example.backend.service.EversignService;
import com.example.backend.dto.request.ContractCreateTemplateRequest;

import lombok.RequiredArgsConstructor;

@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ContractController {


    private final EversignService eversignService;
    private final ConstractService constractService;

    // Endpoint duy nhất: tạo hợp đồng dùng template eversign
    @PreAuthorize("hasAuthority('ROLE_SELLER')")
    @PostMapping("/eversign/create-using-template")
    public ApiResponse<Map<String, Object>> createContractWithTemplate(@RequestBody ContractCreateTemplateRequest request) {
        Map<String, Object> map = eversignService.createDocumentUsingTemplate(request);
        return ApiResponse.<Map<String, Object>>builder().message("đã tạo hợp đồng thành công").data(map).build();
    }

    // handle eversign callback ve (webhook)

    @PostMapping("/eversign/webhook")
    public ApiResponse<String> handleWebHook(@RequestBody Map<String, Object> payload) {

        boolean check = eversignService.handleWebHook(payload);
        String result = check ? "buid true" : "buid false";
        return ApiResponse.<String>builder().message(result).build();

    }
    @PreAuthorize("hasAuthority('ROLE_SELLER')")
    @GetMapping("/contracts/user/{userId}")
    public ApiResponse<List<ContractResponse>> getContractsByUser(@PathVariable Long userId) {
        List<ContractResponse> contracts = constractService.getContractUserInvolved(userId);
        return ApiResponse.<List<ContractResponse>>builder().data(contracts).message("Lấy hợp đồng mà user đã tham gia thành công").build();
    }

}
