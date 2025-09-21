package com.example.backend.dto.response;

import com.example.backend.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CreationUserResponse {
    private String username;
    private String email;
    private String phone;
    private String fullname;
    private Set<Role> roles;
}
