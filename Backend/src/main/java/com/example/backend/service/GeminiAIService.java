package com.example.backend.service;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.support.GenericMessage;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class GeminiAIService {
    private final ChatModel chatModel;

    public String suggestPrice(String productName, String description) {
        String prompt = String.format(
                "Bạn là một hệ thống gợi ý giá sản phẩm.\n" +
                        "Tên sản phẩm: %s\n" +
                        "Mô tả: %s\n\n" +
                        "Yêu cầu:\n" +
                        "- Chỉ trả về một con số duy nhất, đơn vị VND.\n" +
                        "- Không kèm ký tự khác (không có 'VND', '₫', 'Giá là', ...).\n" +
                        "Ví dụ: 1500000",
                productName, description
        );

        ChatResponse response = chatModel.call(new Prompt(
                prompt
        ));
        return response.getResult().getOutput().getText().trim();
    }



}
