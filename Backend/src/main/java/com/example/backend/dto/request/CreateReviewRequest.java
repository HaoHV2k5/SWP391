package com.example.backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateReviewRequest {
    
    @NotNull(message = "REVIEWEE_ID_REQUIRED")
    private Long revieweeId; // ID của seller nhận review
    
    @NotNull(message = "RATING_REQUIRED")
    @Min(value = 1, message = "RATING_MIN_1")
    @Max(value = 5, message = "RATING_MAX_5")
    private Integer rating;
    
    @Size(max = 1000, message = "COMMENT_TOO_LONG")
    private String comment;
    
    private List<MultipartFile> images;
}
