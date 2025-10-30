package com.example.backend.dto.response;

import lombok.Data;

@Data
public class PriceSuggestionResponse {
    private Long suggestedPrice;
    private String reason;
    private String source;
    private String description;
}
