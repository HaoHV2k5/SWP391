package com.example.backend.dto.response;

import com.example.backend.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserListResponse {
    private Long id;
    private String username;
    private String email;
    private String fullname;
    private String phone;
    private String address;
    private String gender;
    private LocalDate yob;
    private String avatar;
    private boolean verified;
    private boolean locked;
    private Set<Role> roles;
}
