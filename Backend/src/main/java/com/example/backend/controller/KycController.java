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
//    @PreAuthorize("hasAuthority='BUYER_SUBMIT'")
    @PostMapping("/submit")
    public ApiResponse<KycDetailResponse> submit(
            @RequestParam("userId") Long userId,
            @RequestParam("frontImage") MultipartFile frontImage,
            @RequestParam("backImage") MultipartFile backImage
    ){
        KycDetailResponse res = kycService.submit(userId, frontImage, backImage);
        return ApiResponse.<KycDetailResponse>builder().data(res).build();
    }
    @PreAuthorize("hasAuthority='APPROVE_KYC'")
    @PostMapping("/{id}/staff/approve")
    public ApiResponse<KycDetailResponse> approveStaff(@PathVariable("id") Long id){
        KycDetailResponse res = kycService.staffApprove(id);
        return ApiResponse.<KycDetailResponse>builder().data(res).message("KYC approved").build();
    }

    @PreAuthorize("hasAuthority='APPROVE_KYC'")
    @PostMapping("/{id}/admin/approve")
    public ApiResponse<KycDetailResponse> approveAdmin(@PathVariable("id") Long id){
        KycDetailResponse res = kycService.adminApprove(id);
        return ApiResponse.<KycDetailResponse>builder().data(res).message("KYC approved").build();
    }
    @PreAuthorize("hasAuthority='REJECT_KYC'")

    @PostMapping("/{id}/reject")
    public ApiResponse<KycDetailResponse> reject(@PathVariable("id") Long id, @RequestBody KycDecisionRequest request){
        KycDetailResponse res = kycService.reject(id, request);
        return ApiResponse.<KycDetailResponse>builder().data(res).message("KYC rejected").build();
    }
    @PreAuthorize("hasAuthority='GET_KYC'")
    @GetMapping("/staff")
    public ApiResponse<List<KycDetailResponse>> getKycByStaff(){
        List<KycDetailResponse> list = kycService.getAllKycByStaff();
        return  ApiResponse.<List<KycDetailResponse>>builder().data(list).build();
    }

    @PreAuthorize("hasAuthority='GET_KYC'")
    @GetMapping("/admin")
    public ApiResponse<List<KycDetailResponse>> getKycByAdmin(){
        List<KycDetailResponse> list = kycService.getAllKycByAdmin();
        return  ApiResponse.<List<KycDetailResponse>>builder().data(list).build();
    }

    // get kyc for user

    @GetMapping("/user")
    public ApiResponse<KycDetailResponse> getKycByUser(@RequestParam Long userId){
        KycDetailResponse response = kycService.getAllKYC(userId);
        return  ApiResponse.<KycDetailResponse>builder().data(response).build();
    }
}


