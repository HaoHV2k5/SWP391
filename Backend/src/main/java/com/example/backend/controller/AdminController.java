package com.example.backend.controller;

import com.example.backend.dto.request.AddPermissionRequest;
import com.example.backend.service.RoleService;
import org.springframework.security.access.prepost.PreAuthorize;
import com.example.backend.dto.request.CreationUserRequest;
import com.example.backend.dto.request.UpdateUserRequest;
import com.example.backend.dto.request.UpdateUserRoleRequest;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.response.CreationUserResponse;
import com.example.backend.dto.response.UserDetailResponse;
import com.example.backend.dto.response.UserListResponse;
import com.example.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import com.example.backend.service.OrderService;
import com.example.backend.service.ConstractService;
import org.springframework.web.bind.annotation.RequestParam;
import com.example.backend.dto.response.OrderEscrowReviewResponse;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin")
@Slf4j
public class AdminController {
    private final UserService userService;
    private final RoleService roleService;
    private final OrderService orderService;
    private final ConstractService constractService;

    // Get all users
    @GetMapping("/users")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ApiResponse<List<UserListResponse>> getAllUsers() {
        List<UserListResponse> users = userService.getAllUsers();
        return ApiResponse.<List<UserListResponse>>builder()
                .data(users)
                .message("Users retrieved successfully")
                .build();
    }

    // Get user by ID
    @GetMapping("/users/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ApiResponse<UserListResponse> getUserById(@PathVariable("id") Long id) {
        UserListResponse user = userService.getUserById(id);
        return ApiResponse.<UserListResponse>builder()
                .data(user)
                .message("User retrieved successfully")
                .build();
    }

    // Create new user
    @PostMapping("/users")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ApiResponse<CreationUserResponse> createUser(@RequestBody @Valid CreationUserRequest request) {
        CreationUserResponse creationUserResponse = userService.createUserByAdmin(request);
        return ApiResponse.<CreationUserResponse>builder()
                .data(creationUserResponse)
                .message("User created successfully and verified")
                .build();
    }

    // Update user
    @PutMapping("/users/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ApiResponse<UserListResponse> updateUser(@PathVariable("id") Long id, 
                                                   @RequestBody @Valid UpdateUserRequest request) {
        UserListResponse updatedUser = userService.updateUser(id, request);
        return ApiResponse.<UserListResponse>builder()
                .data(updatedUser)
                .message("User updated successfully")
                .build();
    }

    // Delete user
    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ApiResponse<Void> deleteUser(@PathVariable("id") Long id) {
        userService.deleteUser(id);
        return ApiResponse.<Void>builder()
                .message("User deleted successfully")
                .build();
    }

    // Lock user account
    @PostMapping("/users/{id}/lock")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ApiResponse<UserDetailResponse> lockUser(@PathVariable("id") Long id) {
        UserDetailResponse updated = userService.lockUserDetail(id);
        return ApiResponse.<UserDetailResponse>builder()
                .data(updated)
                .message("User account locked")
                .build();
    }

    // Unlock user account
    @PostMapping("/users/{id}/unlock")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ApiResponse<UserDetailResponse> unlockUser(@PathVariable("id") Long id) {
        UserDetailResponse updated = userService.unlockUserDetail(id);
        return ApiResponse.<UserDetailResponse>builder()
                .data(updated)
                .message("User account unlocked")
                .build();
    }

    // Update user roles
    @PutMapping("/users/{id}/roles")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ApiResponse<UserListResponse> updateUserRoles(@PathVariable("id") Long id,
                                                         @RequestBody @Valid UpdateUserRoleRequest request) {
        request.setUserId(id);
        UserListResponse updatedUser = userService.updateUserRoles(request);
        return ApiResponse.<UserListResponse>builder()
                .data(updatedUser)
                .message("User roles updated successfully")
                .build();
    }
 // add role
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PostMapping("/add/role")
    public ApiResponse<Void> addPermissionForRole(@RequestBody AddPermissionRequest request){
        roleService.addPermissionForRole(request.getRoleName(), request.getPermissionName());
        return  ApiResponse.<Void>builder()
                .message("Permission added successfully")
                .build();
    }

    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @DeleteMapping("/remove/role")
    public ApiResponse<Void> removePermissionForRole(@RequestBody AddPermissionRequest request){
        roleService.removePermissionForRole(request.getRoleName(), request.getPermissionName());
        return  ApiResponse.<Void>builder()
                .message("Permission removed successfully")
                .build();
    }
// lay danh sach seller request rut tien

    @GetMapping("/order-escrow/seller-requests")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ApiResponse<List<OrderEscrowReviewResponse>> getSellerRequests() {
        List<OrderEscrowReviewResponse> reqs = orderService.getEscrowAdminReviewing();
        return ApiResponse.<List<OrderEscrowReviewResponse>>builder().data(reqs).message("Danh sách yêu cầu seller chờ duyệt").build();
    }
// chap nhận seller request
    @PostMapping("/order-escrow/{escrowId}/approve")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ApiResponse<Void> adminApproveSellerRequest(@PathVariable Long escrowId) {
        orderService.adminApproveEscrow(escrowId);
        return ApiResponse.<Void>builder().message("Đã xác nhận và thông báo buyer thành công").build();
    }
// từ chối seller request
    @PostMapping("/order-escrow/{escrowId}/reject")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ApiResponse<Void> adminRejectSellerRequest(@PathVariable Long escrowId, @RequestParam String reason) {
        orderService.adminRejectEscrow(escrowId, reason);
        return ApiResponse.<Void>builder().message("Đã từ chối yêu cầu và lưu lý do").build();
    }

    /**
     * API để admin có thể gọi thủ công để release escrow money
     * Chạy logic tự động release tiền cho các escrow đủ điều kiện
     */


    @PostMapping("/escrow/manual-release")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ApiResponse<Integer> manualReleaseEscrowMoney() {
        log.info("Admin triggered manual escrow money release");
        int processedCount = constractService.manualReleaseEscrowMoney();
        return ApiResponse.<Integer>builder()
                .data(processedCount)
                .message("Đã xử lý " + processedCount + " escrow thành công")
                .build();
    }

}
