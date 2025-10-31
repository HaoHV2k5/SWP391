package com.example.backend.controller;

import com.example.backend.dto.request.CreatePostingRequest;
import com.example.backend.dto.request.UpdatePostingRequest;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.response.PostingPackageSimpleResponse;
import com.example.backend.entity.PostingPackage;
import com.example.backend.service.PostingPackageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/posting-packages")
public class PostingPackageController {

    private final PostingPackageService postingPackageService;

    // Lấy tất cả gói đăng tin
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @GetMapping
    public ApiResponse<List<PostingPackageSimpleResponse>> getAll() {
        return ApiResponse.<List<PostingPackageSimpleResponse>>builder()
                .message("Lấy danh sách các gói đăng tin thành công")
                .data(postingPackageService.getAll())
                .build();
    }

    // Lấy chi tiết một gói đăng tin
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @GetMapping("/{id}")
    public ApiResponse<PostingPackageSimpleResponse> getById(@PathVariable Long id) {
        return ApiResponse.<PostingPackageSimpleResponse>builder()
                .message("Lấy chi tiết gói đăng tin thành công")
                .data(postingPackageService.getById(id))
                .build();
    }

    // Tạo gói đăng tin mới
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ApiResponse<PostingPackageSimpleResponse> create(@Valid @RequestBody CreatePostingRequest req) {


        return ApiResponse.<PostingPackageSimpleResponse>builder()
                .message("Tạo gói đăng tin thành công")
                .data(postingPackageService.create(req))
                .build();
    }

    // Sửa gói đăng tin
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @PutMapping("/{id}")
    public ApiResponse<PostingPackageSimpleResponse> update(@PathVariable Long id, @Valid @RequestBody UpdatePostingRequest req) {
        return ApiResponse.<PostingPackageSimpleResponse>builder()
                .message("Cập nhật gói đăng tin thành công")
                .data(postingPackageService.update(id, req))
                .build();
    }

    // Xóa gói đăng tin
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        postingPackageService.delete(id);
        return ApiResponse.<Void>builder()
                .message("Xóa gói đăng tin thành công")
                .build();
    }
}
