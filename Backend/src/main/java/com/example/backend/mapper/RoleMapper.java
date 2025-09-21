package com.example.backend.mapper;

import com.example.backend.dto.request.RoleRequest;
import com.example.backend.dto.response.RoleResponse;
import com.example.backend.entity.Role;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface RoleMapper {
    RoleResponse toRoleResponse(Role role);

    @Mapping(target = "permissions", ignore = true)
    Role toRole(RoleRequest request);

    List<RoleResponse> toRoleResponses(List<Role> roles);
}
