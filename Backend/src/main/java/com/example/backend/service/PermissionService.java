package com.example.backend.service;

import com.example.backend.dto.request.PermissionRequest;
import com.example.backend.dto.response.PermissionResponse;
import com.example.backend.entity.Permission;
import com.example.backend.mapper.PermissionMapper;
import com.example.backend.repository.PermissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@RequiredArgsConstructor

@Service
public class PermissionService {
    private final PermissionRepository permissionRepository;
    private  final PermissionMapper permissionMapper;

    public PermissionResponse create(PermissionRequest request) {
        Permission permission = permissionMapper.toPermission(request);
        permissionRepository.save(permission);
        return permissionMapper.toPermissionResponse(permission);

    }

    public List<PermissionResponse> getAllPermission() {

        List<Permission> permissions = permissionRepository.findAll();
        return permissionMapper.toPermissionResponses(permissions);
    }

    public void delete(String permission) {
        permissionRepository.deleteById(permission);

    }
}
