package com.example.backend.controller;

import com.example.backend.dto.request.IntrospectRequest;
import com.example.backend.dto.request.LoginRequest;
import com.example.backend.dto.request.RefreshRequest;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.response.IntrospectResponse;
import com.example.backend.dto.response.LoginResponse;
import com.example.backend.dto.response.RefreshResponse;
import com.example.backend.service.AuthService;
import com.example.backend.service.JwtService;
import com.example.backend.service.UserService;
import com.nimbusds.jose.JOSEException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.text.ParseException;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class AuthController {
    private final AuthService authService;
    private final JwtService  jwtService;
    private final UserService userService;


    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@RequestBody LoginRequest request) {
        LoginResponse result = authService.login(request);
        return ApiResponse.<LoginResponse>builder().data(result).build();
    }

    @PostMapping("/introspect")
    public ApiResponse<IntrospectResponse> introspect(@RequestBody IntrospectRequest request) {
        IntrospectResponse result = authService.introspectToken(request);
        return ApiResponse.<IntrospectResponse>builder().data(result).build();
    }





    @PostMapping("/refresh")
    public ApiResponse<RefreshResponse> refreshToken(@RequestBody  RefreshRequest request) throws ParseException, JOSEException {
        RefreshResponse refreshResponse = authService.refresh(request);
        return  ApiResponse.<RefreshResponse>builder().data(refreshResponse).build();
    }

    @GetMapping("/google/success")
    public ApiResponse<Map<String, Object>> googleSuccess(OAuth2AuthenticationToken token) {
        if (token == null) {
            return ApiResponse.<Map<String, Object>>builder()
                    .code(400)
                    .message("OAuth2AuthenticationToken is null")
                    .build();
        }
        Map<String, Object> result = authService.googleLogin(token);
        return ApiResponse.<Map<String, Object>>builder().data(result).build();
    }






}
