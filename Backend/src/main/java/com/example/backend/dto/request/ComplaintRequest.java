package com.example.backend.dto.request;

import com.example.backend.enums.ComplaintCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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
public class ComplaintRequest {
    
    @NotNull(message = "CONTRACT_ID_REQUIRED")
    private Long contractId;
    
    @NotBlank(message = "TITLE_REQUIRED")
    @Size(max = 255, message = "TITLE_TOO_LONG")
    private String title;
    
    @NotBlank(message = "DESCRIPTION_REQUIRED")
    @Size(max = 2000, message = "DESCRIPTION_TOO_LONG")
    private String description;
    
    @NotNull(message = "CATEGORY_REQUIRED")
    private ComplaintCategory category;
    
    /**
     * Danh sách ảnh minh chứng (optional)
     */
    private List<MultipartFile> evidenceImages;
}
