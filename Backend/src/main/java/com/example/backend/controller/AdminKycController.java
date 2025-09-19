package com.example.backend.controller;

import com.example.backend.dto.request.KycDecisionRequest;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.response.KycDetailResponse;
import com.example.backend.service.KycService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/kyc")
public class AdminKycController {
    private final KycService kycService;

    @PostMapping("/{id}/approve")
    public ApiResponse<KycDetailResponse> approve(@PathVariable("id") Long id){
        KycDetailResponse res = kycService.approve(id);
        return ApiResponse.<KycDetailResponse>builder().data(res).message("KYC approved").build();
    }

    @PostMapping("/{id}/reject")
    public ApiResponse<KycDetailResponse> reject(@PathVariable("id") Long id, @RequestBody KycDecisionRequest request){
        KycDetailResponse res = kycService.reject(id, request);
        return ApiResponse.<KycDetailResponse>builder().data(res).message("KYC rejected").build();
    }
}


