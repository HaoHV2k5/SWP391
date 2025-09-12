package com.example.backend.controller;

import com.example.backend.dto.request.RegisterRequest;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.response.RegisterResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.backend.service.UserService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/users")
@Slf4j
public class UserController {
    private final UserService userService;
    @PostMapping("/register")
    public ApiResponse<RegisterResponse> register(@RequestBody @Valid  RegisterRequest request){

        RegisterResponse registerResponse = userService.createUser(request);
        return ApiResponse.<RegisterResponse>builder().data(registerResponse).build();
    }
}
