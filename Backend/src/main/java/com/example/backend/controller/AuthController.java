package com.example.backend.controller;

import com.example.backend.dto.request.IntrospectRequest;
import com.example.backend.dto.request.LoginRequest;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.response.IntrospectResponse;
import com.example.backend.dto.response.LoginResponse;
import com.example.backend.service.AuthService;
import com.example.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class AuthController {
    private final AuthService uauthService;
    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@RequestBody LoginRequest request) {
        LoginResponse result = uauthService.login(request);
        return ApiResponse.<LoginResponse>builder().data(result).build();
    }

    @PostMapping("/introspect")
    public ApiResponse<IntrospectResponse> introspect(@RequestBody IntrospectRequest request) {
        IntrospectResponse result = uauthService.introspectToken(request);
        return ApiResponse.<IntrospectResponse>builder().data(result).build();
    }
//   test login by gg
    @GetMapping("/me")
    public Object getCurrentUser(Authentication authentication) {
        return authentication.getPrincipal();
    }
}
