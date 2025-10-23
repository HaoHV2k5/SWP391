package com.example.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class FirebaseUserRequest {
    @NotBlank(message = "Firebase UID is required")
    private String firebaseUid;
    
    @Email(message = "Invalid email format")
    @NotBlank(message = "Email is required")
    private String email;
    
    @NotBlank(message = "Full name is required")
    private String fullName;
    
    private String avatar;
    
    @NotBlank(message = "Provider is required")
    private String provider;
    
    private String firebaseToken; // Optional, for verification
}
