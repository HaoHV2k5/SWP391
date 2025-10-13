package com.example.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserPackageTransactionResponse {
    private Long id;
    private Long userId;
    private Long packageId;
    LocalDateTime endTime;
    LocalDateTime startTime;


}
