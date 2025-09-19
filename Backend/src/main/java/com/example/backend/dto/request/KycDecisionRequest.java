package com.example.backend.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class KycDecisionRequest {
    private String reason; // optional on approve, required on reject
}


