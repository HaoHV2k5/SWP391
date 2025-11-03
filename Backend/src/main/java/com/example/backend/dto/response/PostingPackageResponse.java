package com.example.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PostingPackageResponse {
    private String name;//
    private String description;//
    private BigDecimal price; //
    private Integer duration; //
    private Integer postPossible;
    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private Boolean requireApproval; // Field để frontend kiểm tra gói có cần duyệt không

}
