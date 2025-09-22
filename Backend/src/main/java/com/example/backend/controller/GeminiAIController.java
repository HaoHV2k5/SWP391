package com.example.backend.controller;

import com.example.backend.dto.response.ApiResponse;
import com.example.backend.service.GeminiAIService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/pricing")
@RequiredArgsConstructor
public class GeminiAIController {
    private final GeminiAIService  geminiAIService;
    @GetMapping("/suggest")
    public ApiResponse<String> suggestPrice(
            @RequestParam String name,
            @RequestParam String desc) {
        String response = geminiAIService.suggestPrice(name, desc);

        return ApiResponse.<String>builder().data(response).build();
    }
}
