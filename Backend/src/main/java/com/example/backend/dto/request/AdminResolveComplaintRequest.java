package com.example.backend.dto.request;

import com.example.backend.enums.ComplaintStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminResolveComplaintRequest {
    
    @NotNull(message = "STATUS_REQUIRED")
    private ComplaintStatus status;
    
    @Size(max = 2000, message = "STAFF_NOTES_TOO_LONG")
    private String staffNotes;
}
