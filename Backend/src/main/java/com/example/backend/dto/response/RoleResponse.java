package com.example.backend.dto.response;

import com.example.backend.entity.Permission;

import java.util.Set;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder

public class RoleResponse {
    private String name;
    private String description;
    private Set<Permission> permissions;
}
