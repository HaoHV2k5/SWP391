package com.example.backend.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateUserRoleRequest {
    @NotNull(message = "USER_ID_NOT_BLANK")
    private Long userId;
    
    @NotEmpty(message = "ROLES_NOT_BLANK")
    private Set<String> roleNames;
}
