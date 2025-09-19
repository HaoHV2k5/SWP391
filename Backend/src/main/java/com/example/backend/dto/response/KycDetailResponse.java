package com.example.backend.dto.response;

import com.example.backend.enums.KycStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@Builder
public class KycDetailResponse {
    private Long id;
    private Long userId;
    private String frontImageUrl;
    private String backImageUrl;
    private KycStatus status;
    private String rejectionReason;
    private Instant createdAt;
    private Instant updatedAt;
}


