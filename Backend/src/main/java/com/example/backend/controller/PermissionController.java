package com.example.backend.controller;

import com.example.backend.dto.request.PermissionRequest;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.response.PermissionResponse;
import com.example.backend.service.PermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor

@RequestMapping("/permissions")
public class PermissionController {

    private final PermissionService permissionService;

    @PostMapping("/create-permission")
    public ApiResponse<PermissionResponse> create(@RequestBody PermissionRequest request) {

        return ApiResponse.<PermissionResponse>builder().data(permissionService.create(request)).build();

    }

    @GetMapping("/permissions")
    public ApiResponse<List<PermissionResponse>> getPermissions() {
        return ApiResponse.<List<PermissionResponse>>builder().data(permissionService.getAllPermission()).build();
    }

    @DeleteMapping("/{permission}")
    public ApiResponse<Void> deletePermission(@PathVariable String permission) {
        permissionService.delete(permission);
        return ApiResponse.<Void>builder().build();
    }

}
