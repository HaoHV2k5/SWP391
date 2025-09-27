package com.example.backend.service;

import com.example.backend.dto.request.RoleRequest;
import com.example.backend.dto.response.RoleResponse;
import com.example.backend.entity.Permission;
import com.example.backend.entity.Role;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.RoleMapper;
import com.example.backend.repository.PermissionRepository;
import com.example.backend.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RoleService {

    private final RoleRepository roleRepository;
    private final RoleMapper roleMapper;
    private final PermissionRepository permissionRepository;

    public RoleResponse create(RoleRequest request) {
        var roles = roleMapper.toRole(request);
        List<Permission> permissions = permissionRepository.findAllById(request.getPermissions());
        roles.setPermissions(new HashSet<>(permissions));
        roleRepository.save(roles);

        return roleMapper.toRoleResponse(roles);

    }

    public List<RoleResponse> getAllRoles() {

        List<Role> roles = roleRepository.findAll();
        return roleMapper.toRoleResponses(roles);
    }

    public void delete(String role) {
        roleRepository.deleteById(role);

    }
    public void addPermissionForRole(String roleName, String permission) {
        Role role = roleRepository.findById(roleName).orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_EXISTED));
       Permission per = permissionRepository.findById(permission).orElseThrow(() -> new AppException(ErrorCode.PERMISSION_NOT_EXISTED));

        role.getPermissions().add(per);
        roleRepository.save(role);
    }


}
