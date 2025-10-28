package com.example.backend.controller;

import com.example.backend.dto.request.WithdrawalRequest;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.response.WithdrawalResponse;
import com.example.backend.service.WithdrawalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/withdrawal")
@RequiredArgsConstructor
@Slf4j
public class WithdrawalController {

    private final WithdrawalService withdrawalService;

    /**
     * Tạo yêu cầu rút tiền
     * POST /api/withdrawal/request
     */
    @PostMapping("/request")
    @PreAuthorize("hasAnyAuthority('ROLE_SELLER', 'ROLE_BUYER')")
    public ApiResponse<WithdrawalResponse> createWithdrawalRequest(
            @RequestParam Long userId,
            @Valid @RequestBody WithdrawalRequest request) {
        
        log.info("Tạo yêu cầu rút tiền cho user {} với số tiền {}", userId, request.getAmount());
        
        WithdrawalResponse response = withdrawalService.createWithdrawalRequest(userId, request);
        
        return ApiResponse.<WithdrawalResponse>builder()
                .code(1000)
                .message("Tạo yêu cầu rút tiền thành công")
                .data(response)
                .build();
    }

    /**
     * Xác nhận yêu cầu rút tiền (Admin)
     * PUT /api/withdrawal/{withdrawalId}/confirm
     */
    @PutMapping("/{withdrawalId}/confirm")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ApiResponse<WithdrawalResponse> confirmWithdrawal(
            @PathVariable Long withdrawalId,
            @RequestParam Long adminId) {
        
        log.info("Admin {} xác nhận yêu cầu rút tiền {}", adminId, withdrawalId);
        
        WithdrawalResponse response = withdrawalService.confirmWithdrawal(withdrawalId, adminId);
        
        return ApiResponse.<WithdrawalResponse>builder()
                .code(1000)
                .message("Xác nhận rút tiền thành công")
                .data(response)
                .build();
    }

    /**
     * Từ chối yêu cầu rút tiền (Admin)
     * PUT /api/withdrawal/{withdrawalId}/reject
     */
    @PutMapping("/{withdrawalId}/reject")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ApiResponse<WithdrawalResponse> rejectWithdrawal(
            @PathVariable Long withdrawalId,
            @RequestParam Long adminId,
            @RequestParam(required = false, defaultValue = "Không đủ điều kiện") String reason) {
        
        log.info("Admin {} từ chối yêu cầu rút tiền {} với lý do: {}", adminId, withdrawalId, reason);
        
        WithdrawalResponse response = withdrawalService.rejectWithdrawal(withdrawalId, adminId, reason);
        
        return ApiResponse.<WithdrawalResponse>builder()
                .code(1000)
                .message("Từ chối yêu cầu rút tiền thành công")
                .data(response)
                .build();
    }

    /**
     * Hủy yêu cầu rút tiền (User)
     * PUT /api/withdrawal/{withdrawalId}/cancel
     */
    @PutMapping("/{withdrawalId}/cancel")
    @PreAuthorize("hasAnyAuthority('ROLE_SELLER', 'ROLE_BUYER')")
    public ApiResponse<WithdrawalResponse> cancelWithdrawal(
            @PathVariable Long withdrawalId,
            @RequestParam Long userId) {
        
        log.info("User {} hủy yêu cầu rút tiền {}", userId, withdrawalId);
        
        WithdrawalResponse response = withdrawalService.cancelWithdrawal(withdrawalId, userId);
        
        return ApiResponse.<WithdrawalResponse>builder()
                .code(1000)
                .message("Hủy yêu cầu rút tiền thành công")
                .data(response)
                .build();
    }

    /**
     * Lấy danh sách yêu cầu rút tiền của người dùng
     * GET /api/withdrawal/my-requests
     */
    @GetMapping("/my-requests")
    @PreAuthorize("hasAnyAuthority('ROLE_SELLER', 'ROLE_BUYER')")
    public ApiResponse<List<WithdrawalResponse>> getUserWithdrawals(
            @RequestParam Long userId) {
        
        log.info("Lấy danh sách yêu cầu rút tiền của user {}", userId);
        
        List<WithdrawalResponse> responses = withdrawalService.getUserWithdrawals(userId);
        
        return ApiResponse.<List<WithdrawalResponse>>builder()
                .code(1000)
                .message("Lấy danh sách yêu cầu rút tiền thành công")
                .data(responses)
                .build();
    }

    /**
     * Lấy danh sách tất cả yêu cầu rút tiền (Admin)
     * GET /api/withdrawal/all
     */
    @GetMapping("/all")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ApiResponse<List<WithdrawalResponse>> getAllWithdrawals() {
        
        log.info("Admin lấy danh sách tất cả yêu cầu rút tiền");
        
        List<WithdrawalResponse> responses = withdrawalService.getAllWithdrawals();
        
        return ApiResponse.<List<WithdrawalResponse>>builder()
                .code(1000)
                .message("Lấy danh sách tất cả yêu cầu rút tiền thành công")
                .data(responses)
                .build();
    }

    /**
     * Lấy chi tiết yêu cầu rút tiền
     * GET /api/withdrawal/{withdrawalId}
     */
    @GetMapping("/{withdrawalId}")
    @PreAuthorize("hasAnyAuthority('ROLE_SELLER', 'ROLE_BUYER', 'ROLE_ADMIN')")
    public ApiResponse<WithdrawalResponse> getWithdrawalDetail(
            @PathVariable Long withdrawalId) {
        
        log.info("Lấy chi tiết yêu cầu rút tiền {}", withdrawalId);
        
        WithdrawalResponse response = withdrawalService.getWithdrawalDetail(withdrawalId);
        
        return ApiResponse.<WithdrawalResponse>builder()
                .code(1000)
                .message("Lấy chi tiết yêu cầu rút tiền thành công")
                .data(response)
                .build();
    }

    /**
     * Lấy danh sách yêu cầu rút tiền theo trạng thái (Admin)
     * GET /api/withdrawal/status/{status}
     */
    @GetMapping("/status/{status}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ApiResponse<List<WithdrawalResponse>> getWithdrawalsByStatus(
            @PathVariable String status) {
        
        log.info("Admin lấy danh sách yêu cầu rút tiền theo trạng thái: {}", status);
        
        List<WithdrawalResponse> allWithdrawals = withdrawalService.getAllWithdrawals();
        List<WithdrawalResponse> filteredWithdrawals = allWithdrawals.stream()
                .filter(w -> status.equalsIgnoreCase(w.getStatus()))
                .toList();
        
        return ApiResponse.<List<WithdrawalResponse>>builder()
                .code(1000)
                .message("Lấy danh sách yêu cầu rút tiền theo trạng thái thành công")
                .data(filteredWithdrawals)
                .build();
    }
}
