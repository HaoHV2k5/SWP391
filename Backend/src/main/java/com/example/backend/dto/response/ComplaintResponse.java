package com.example.backend.dto.response;

import com.example.backend.enums.ComplaintCategory;
import com.example.backend.enums.ComplaintStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComplaintResponse {
    
    private Long id;
    
    private Long buyerId;
    private String buyerName;
    private String buyerEmail;
    
    private Long sellerId;
    private String sellerName;
    private String sellerEmail;
    
    private Long productId;
    private String productTitle;
    
    private Long contractId;
    private String contractCode;
    
    private String title;
    private String description;
    
    private ComplaintStatus status;
    private ComplaintCategory category;
    
    private List<String> evidenceUrls;
    private String staffNotes;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;
}
