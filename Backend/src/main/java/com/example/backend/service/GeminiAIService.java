package com.example.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.messaging.support.GenericMessage;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GeminiAIService {
    private final ChatModel chatModel;
    public String suggestPrice(String productName, String description){
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

        ChatResponse chatResponse = chatModel.call(new Prompt(prompt));
        String content = chatResponse.getResult().getOutput().getText();
        return content == null? "":content.trim();

    }
}
