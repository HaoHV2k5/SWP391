package com.example.backend.controller;

import com.example.backend.dto.request.AdminResolveComplaintRequest;
import com.example.backend.dto.request.ComplaintRequest;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.response.ComplaintResponse;
import com.example.backend.entity.User;
import com.example.backend.service.ComplaintService;
import com.example.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/complaints")
@RequiredArgsConstructor
public class ComplaintController {
    
    private final ComplaintService complaintService;
    private final UserService userService;
    
    /**
     * Tạo complaint mới - chỉ buyer có thể tạo
     */
    @PostMapping(consumes = "multipart/form-data")
    @PreAuthorize("hasAnyAuthority('ROLE_BUYER', 'ROLE_USER')")
    public ApiResponse<ComplaintResponse> createComplaint(@ModelAttribute ComplaintRequest request, Authentication authentication) {
        String username = authentication.getName();
        User user = userService.getUserByUsername(username);
        
        ComplaintResponse response = complaintService.createComplaint(request, user.getId());
        
        return ApiResponse.<ComplaintResponse>builder()
                .message("Complaint created successfully")
                .data(response)
                .build();
    }
    
    /**
     * Lấy tất cả complaint của buyer hiện tại
     * Cho phép cả buyer và seller (seller cũng có thể là buyer khi mua hàng)
     */
    @GetMapping("/my-complaints")
    @PreAuthorize("hasAnyAuthority('ROLE_BUYER', 'ROLE_USER', 'ROLE_SELLER')")
    public ApiResponse<List<ComplaintResponse>> getMyComplaints(Authentication authentication) {
        String username = authentication.getName();
        User user = userService.getUserByUsername(username);
        
        List<ComplaintResponse> complaints = complaintService.getComplaintsByBuyer(user.getId());
        
        return ApiResponse.<List<ComplaintResponse>>builder()
                .message("Complaints retrieved successfully")
                .data(complaints)
                .build();
    }
    
    /**
     * Lấy tất cả complaint về seller hiện tại
     */
    @GetMapping("/complaints-about-me")
    @PreAuthorize("hasAuthority('ROLE_SELLER')")
    public ApiResponse<List<ComplaintResponse>> getComplaintsAboutMe(Authentication authentication) {
        String username = authentication.getName();
        User user = userService.getUserByUsername(username);
        
        List<ComplaintResponse> complaints = complaintService.getComplaintsBySeller(user.getId());
        
        return ApiResponse.<List<ComplaintResponse>>builder()
                .message("Complaints retrieved successfully")
                .data(complaints)
                .build();
    }
    
    /**
     * Lấy chi tiết một complaint
     */
    @GetMapping("/{complaintId}")
    @PreAuthorize("hasAnyAuthority('ROLE_BUYER', 'ROLE_USER', 'ROLE_SELLER', 'ROLE_STAFF' ,'ROLE_ADMIN')")
    public ApiResponse<ComplaintResponse> getComplaintById(@PathVariable Long complaintId) {
        ComplaintResponse complaint = complaintService.getComplaintById(complaintId);
        
        return ApiResponse.<ComplaintResponse>builder()
                .message("Complaint retrieved successfully")
                .data(complaint)
                .build();
    }
    
    /**
     * Lấy tất cả complaint (admin và staff)
     */
    @GetMapping("/admin/all")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_STAFF')")
    public ApiResponse<List<ComplaintResponse>> getAllComplaints() {
        List<ComplaintResponse> complaints = complaintService.getAllComplaints();
        
        return ApiResponse.<List<ComplaintResponse>>builder()
                .message("All complaints retrieved successfully")
                .data(complaints)
                .build();
    }
    
    /**
     * Kiểm tra buyer và seller đã có giao dịch hoàn thành chưa
     */
    @GetMapping("/check-transaction/{sellerId}")
    @PreAuthorize("hasAnyAuthority('ROLE_BUYER', 'ROLE_USER')")
    public ApiResponse<Boolean> checkCompletedTransaction(@PathVariable Long sellerId, Authentication authentication) {
        String username = authentication.getName();
        User user = userService.getUserByUsername(username);
        
        boolean hasTransaction = complaintService.hasCompletedTransaction(user.getId(), sellerId);
        
        return ApiResponse.<Boolean>builder()
                .message("Transaction check completed")
                .data(hasTransaction)
                .build();
    }
    
    /**
     * Admin giải quyết complaint
     */
    @PutMapping("/admin/{complaintId}/resolve")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_STAFF')")
    public ApiResponse<ComplaintResponse> adminResolveComplaint(
            @PathVariable Long complaintId, 
            @RequestBody AdminResolveComplaintRequest request) {
        
        ComplaintResponse complaint = complaintService.adminResolveComplaint(complaintId, request);
        
        return ApiResponse.<ComplaintResponse>builder()
                .message("Complaint resolved successfully")
                .data(complaint)
                .build();
    }
    
    /**
     * Admin bắt đầu xem xét complaint
     */
    @PutMapping("/admin/{complaintId}/start-review")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_STAFF')")
    public ApiResponse<ComplaintResponse> adminStartReview(@PathVariable Long complaintId) {
        ComplaintResponse complaint = complaintService.adminStartReview(complaintId);
        
        return ApiResponse.<ComplaintResponse>builder()
                .message("Complaint moved to under review")
                .data(complaint)
                .build();
    }
}
