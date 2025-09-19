package com.example.backend.controller;

import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.response.KycDetailResponse;
import com.example.backend.service.KycService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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
}


