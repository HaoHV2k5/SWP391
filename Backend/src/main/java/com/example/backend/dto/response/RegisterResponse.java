package com.example.backend.dto.response;

import com.example.backend.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterResponse {
    private String username;
    private String email;
    private String phone;
    private String fullname;
    private Set<RoleResponse> roles;
}
