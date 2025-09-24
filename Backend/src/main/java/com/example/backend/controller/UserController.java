package com.example.backend.controller;

import com.example.backend.dto.request.*;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.response.ResetPasswordResponse;
import com.example.backend.dto.response.UserDetailResponse;
import com.example.backend.entity.User;
import com.example.backend.service.MailService;
import com.example.backend.service.OtpService;
import jakarta.mail.MessagingException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.example.backend.service.UserService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/users")
@Slf4j
public class UserController {
    private final UserService userService;
    private final OtpService otpService;
    private final MailService mailService;

    private  String LOGIN_URL = "http://localhost:5173/login.html";
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
        if(check){
            try {
                mailService.sendEmail(user.getEmail(), LOGIN_URL,user.getUsername());
            } catch (MessagingException e) {
                throw new RuntimeException(e);
            }
        }
        return ApiResponse.<Void>builder().message(message).build();
    }

    @PostMapping("/resend-otp")
    public ApiResponse<Void> resendOtp(@RequestBody ResendOtpRequest request){
        User user = userService.getUser(request.getEmail());
        otpService.generateOtpCode(user);
        return ApiResponse.<Void>builder().message("A new OTP has been sent to your email.").build();

    }

    @GetMapping("/me")
    public ApiResponse<UserDetailResponse> getCurrentUser(Authentication authentication) {
        String username = authentication.getName();
        UserDetailResponse userDetail = userService.getUserDetailByUsername(username);
        return ApiResponse.<UserDetailResponse>builder()
                .data(userDetail)
                .message("User information retrieved successfully")
                .build();
    }
    @PostMapping("/forgot-password")
    public ApiResponse<String> forgotPassword(@RequestBody @Valid ForgotPassword request){
        User user = userService.getUser(request.getEmail());
        otpService.generateOtpCode(user);
        return ApiResponse.<String>builder().message("Đã gửi otp để xác thực").data(user.getEmail()).build();
    }

    @PostMapping("/reset-password")
    public ApiResponse<ResetPasswordResponse> handleResetPassword(@RequestBody @Valid ResetPasswordRequest request){
        User user = userService.getUser(request.getEmail());

        boolean result  = userService.resetPassword(request, user);
        try {
            mailService.sendRegisterNotice(user.getEmail(), user.getFullname());
        } catch (MessagingException e) {
            throw new RuntimeException(e);
        }
        return ApiResponse.<ResetPasswordResponse>builder().message("Reset Password successfully")
                .data(ResetPasswordResponse.builder().success(result).build()).build();
    }




}