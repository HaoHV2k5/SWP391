package com.example.backend.mapper;

import com.example.backend.dto.request.PermissionRequest;
import com.example.backend.dto.response.PermissionResponse;
import com.example.backend.entity.Permission;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PermissionMapper {
    PermissionResponse toPermissionResponse(Permission permission);

    Permission toPermission(PermissionRequest request);

    List<PermissionResponse> toPermissionResponses(List<Permission> permissions);

}
