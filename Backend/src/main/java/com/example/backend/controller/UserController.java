package com.example.backend.controller;

import com.example.backend.dto.request.CreationUserRequest;
import com.example.backend.dto.request.RegisterRequest;
import com.example.backend.dto.request.ResendOtpRequest;
import com.example.backend.dto.request.VerifyOtpRequest;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.response.CreationUserResponse;
import com.example.backend.dto.response.RegisterResponse;
import com.example.backend.entity.User;
import com.example.backend.service.OtpService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import com.example.backend.service.UserService;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/users")
@Slf4j
public class UserController {
    private final UserService userService;
    private final OtpService otpService;
    @PostMapping("/register")
    public ApiResponse<Void> register(@RequestBody @Valid  RegisterRequest request){

        User user = userService.registerUser(request);
        otpService.generateOtpCode(user);
        return ApiResponse.<Void>builder().message("Check your email for the OTP to finish signing up.").build();
    }


    @PostMapping("/verify-otp")
    public ApiResponse<Void> verifyOtp(@RequestBody  VerifyOtpRequest request){
        User user = userService.getUser(request.getEmail());
        boolean check = otpService.verifyOtpCode(user,request.getOtp());
        String message = check ? "Verification successful. Your account is now activated" : "Invalid or expired OTP";
        return ApiResponse.<Void>builder().message(message).build();
    }

    @PostMapping("/resend-otp")
    public ApiResponse<Void> resendOtp(@RequestBody ResendOtpRequest request){
        User user = userService.getUser(request.getEmail());
        otpService.generateOtpCode(user);
        return ApiResponse.<Void>builder().message("A new OTP has been sent to your email.").build();

    }






}
