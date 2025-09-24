package com.example.backend.controller;

import com.example.backend.dto.request.KycDecisionRequest;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.response.KycDetailResponse;
import com.example.backend.entity.KycSubmission;
import com.example.backend.service.KycService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/kyc")
public class KycController {
    private final KycService kycService;
    @PostMapping("/submit")
    public ApiResponse<KycDetailResponse> submit(
            @RequestParam("userId") Long userId,
            @RequestParam("frontImage") MultipartFile frontImage,
            @RequestParam("backImage") MultipartFile backImage
    ){
        KycDetailResponse res = kycService.submit(userId, frontImage, backImage);
        return ApiResponse.<KycDetailResponse>builder().data(res).build();
    }
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

    @GetMapping("/kycs")
    public ApiResponse<List<KycDetailResponse>> kycs(){
        List<KycDetailResponse> list = kycService.getAllKyc();
        return  ApiResponse.<List<KycDetailResponse>>builder().data(list).build();
    }
}


