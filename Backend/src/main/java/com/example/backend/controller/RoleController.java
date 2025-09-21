package com.example.backend.controller;

import com.example.backend.dto.request.RoleRequest;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.response.RoleResponse;
import com.example.backend.service.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor

@RequestMapping("/roles")
public class RoleController {

    private final RoleService roleService;

    @PostMapping("/create-role")
    public ApiResponse<RoleResponse> createRole(@RequestBody RoleRequest request) {
        RoleResponse role = roleService.create(request);
        return ApiResponse.<RoleResponse>builder().data(role).build();
    }

    @GetMapping("/roles")
    public ApiResponse<List<RoleResponse>> getALL() {
        List<RoleResponse> responses = roleService.getAllRoles();
        return ApiResponse.<List<RoleResponse>>builder().data(responses).build();
    }

    @DeleteMapping("/{roleName}")
    public ApiResponse<Void> deleteRole(@PathVariable String roleName) {
        roleService.delete(roleName);
        return ApiResponse.<Void>builder().build();
    }
}
