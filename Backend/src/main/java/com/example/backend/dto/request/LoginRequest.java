package com.example.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data

public class LoginRequest {

    @NotBlank(message = "USERNAME_NOT_BLANK")
    private String username;

    @NotBlank (message = "PASSWORD_NOT_BLANK")
    private String password;
}
