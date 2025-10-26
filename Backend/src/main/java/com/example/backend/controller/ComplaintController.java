package com.example.backend.controller;

import com.example.backend.dto.request.ComplaintRequest;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.response.ComplaintResponse;
import com.example.backend.entity.User;
import com.example.backend.service.ComplaintService;
import com.example.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
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
    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_BUYER')")
    public ResponseEntity<ApiResponse<ComplaintResponse>> createComplaint(@RequestBody ComplaintRequest request, Authentication authentication) {
        String username = authentication.getName();
        User user = userService.getUserByUsername(username);
        
        ComplaintResponse response = complaintService.createComplaint(request, user.getId());
        
        return ResponseEntity.ok(ApiResponse.<ComplaintResponse>builder()
                .message("Complaint created successfully")
                .data(response)
                .build());
    }
    
    /**
     * Lấy tất cả complaint của buyer hiện tại
     */
    @GetMapping("/my-complaints")
    @PreAuthorize("hasAuthority('ROLE_BUYER')")
    public ResponseEntity<ApiResponse<List<ComplaintResponse>>> getMyComplaints(Authentication authentication) {
        String username = authentication.getName();
        User user = userService.getUserByUsername(username);
        
        List<ComplaintResponse> complaints = complaintService.getComplaintsByBuyer(user.getId());
        
        return ResponseEntity.ok(ApiResponse.<List<ComplaintResponse>>builder()
                .message("Complaints retrieved successfully")
                .data(complaints)
                .build());
    }
    
    /**
     * Lấy tất cả complaint về seller hiện tại
     */
    @GetMapping("/complaints-about-me")
    @PreAuthorize("hasAuthority('ROLE_SELLER')")
    public ResponseEntity<ApiResponse<List<ComplaintResponse>>> getComplaintsAboutMe(Authentication authentication) {
        String username = authentication.getName();
        User user = userService.getUserByUsername(username);
        
        List<ComplaintResponse> complaints = complaintService.getComplaintsBySeller(user.getId());
        
        return ResponseEntity.ok(ApiResponse.<List<ComplaintResponse>>builder()
                .message("Complaints retrieved successfully")
                .data(complaints)
                .build());
    }
    
    /**
     * Lấy chi tiết một complaint
     */
    @GetMapping("/{complaintId}")
    @PreAuthorize("hasAnyAuthority('ROLE_BUYER', 'ROLE_SELLER', 'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<ComplaintResponse>> getComplaintById(@PathVariable Long complaintId) {
        ComplaintResponse complaint = complaintService.getComplaintById(complaintId);
        
        return ResponseEntity.ok(ApiResponse.<ComplaintResponse>builder()
                .message("Complaint retrieved successfully")
                .data(complaint)
                .build());
    }
    
    /**
     * Lấy tất cả complaint (chỉ admin)
     */
    @GetMapping("/admin/all")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<List<ComplaintResponse>>> getAllComplaints() {
        List<ComplaintResponse> complaints = complaintService.getAllComplaints();
        
        return ResponseEntity.ok(ApiResponse.<List<ComplaintResponse>>builder()
                .message("All complaints retrieved successfully")
                .data(complaints)
                .build());
    }
    
    /**
     * Kiểm tra buyer và seller đã có giao dịch hoàn thành chưa
     */
    @GetMapping("/check-transaction/{sellerId}")
    @PreAuthorize("hasAuthority('ROLE_BUYER')")
    public ResponseEntity<ApiResponse<Boolean>> checkCompletedTransaction(@PathVariable Long sellerId, Authentication authentication) {
        String username = authentication.getName();
        User user = userService.getUserByUsername(username);
        
        boolean hasTransaction = complaintService.hasCompletedTransaction(user.getId(), sellerId);
        
        return ResponseEntity.ok(ApiResponse.<Boolean>builder()
                .message("Transaction check completed")
                .data(hasTransaction)
                .build());
    }
}
