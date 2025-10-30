package com.example.backend.controller;

import com.example.backend.dto.request.PriceRequest;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.response.PriceSuggestionResponse;
import com.example.backend.service.GeminiAIService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/pricing")
@RequiredArgsConstructor
public class GeminiAIController {
    private final GeminiAIService  geminiAIService;
    @PreAuthorize("hasAuthority('ROLE_SELLER')")
    @PostMapping("/suggest")
    public ApiResponse<PriceSuggestionResponse> suggestPrice(
            @RequestBody PriceRequest request) {
        PriceSuggestionResponse response = geminiAIService.suggestPrice(request);

        return ApiResponse.<PriceSuggestionResponse>builder().data(response).build();
    }
}
