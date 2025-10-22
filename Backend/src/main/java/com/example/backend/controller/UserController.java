package com.example.backend.controller;

import com.example.backend.dto.request.*;
import com.example.backend.dto.response.*;
import com.example.backend.entity.User;
import com.example.backend.service.*;
import jakarta.mail.MessagingException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/users")
@Slf4j
public class UserController {
    private final UserService userService;
    private final OtpService otpService;
    private final MailService mailService;
    private final WalletTransactionService walletTransactionService;
    private  final TransactionService transactionService;


    @Value("${email.login.facebook}")
    private String emailLoginFacebook;

    private  String LOGIN_URL = "http://localhost:5173/login.html";
    @PostMapping("/register")
    public ApiResponse<Void> register(@RequestBody @Valid  RegisterRequest request){

        User user = userService.registerUser(request);
        userService.initWalletAndWishlist(user);
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

    // nhap email khi dang nhap vao bang fb
    @PostMapping("/phone/input")
    public ApiResponse<UserDetailResponse> inputPhoneInfo(@RequestBody @Valid PhoneInfoRequest request) {
        UserDetailResponse user =userService.updatePhoneNumber(request);
        return ApiResponse.<UserDetailResponse>builder().data(user).build();

    }

    @PutMapping("/update")

    public ApiResponse<UserListResponse> updateUser(Authentication authentication,
                                                    @RequestBody @Valid UpdateUserRequest request) {
        String name = authentication.getName();
        Long id = userService.getIdByUsername(name);
        UserListResponse updatedUser = userService.updateUser(id, request);
        return ApiResponse.<UserListResponse>builder()
                .data(updatedUser)
                .message("User updated successfully")
                .build();
    }

    @PutMapping("/change/password")
    public ApiResponse<Boolean> updatePasswordUser(Authentication authentication,@RequestBody @Valid  UpdatePasswordRequest request) {
        String  username = authentication.getName();
        User user = userService.getUserByUsername(username);
        userService.updatePassword(user,request.getPassword());
        return ApiResponse.<Boolean>builder().message("Password updated successfully").build();
    }
    // user lay history waller transaction cua minh
    @GetMapping("/walletTransaction")
    public ApiResponse<List<WalletTransactionResponse>> getWalletTransactionByUserID(Authentication authentication){
        String username = authentication.getName();
        User user = userService.getUserByUsername(username);
        List<WalletTransactionResponse> responses = walletTransactionService.getAllWalletTransactionsByUserID(user.getId());
        return ApiResponse.<List<WalletTransactionResponse>>builder()
                .data(responses)
                .message("lấy danh sách wallet transactions của user thành công ")
                .build();
    }

    // user lay danh sach history
    @GetMapping("/transaction")
    public ApiResponse<List<TransactionHistoryResponse>> getTransactionUserid(Authentication authentication){
        String username = authentication.getName();
        User user = userService.getUserByUsername(username);
        List<TransactionHistoryResponse> responses = transactionService.getTranctionByUserid(user.getId());
        return ApiResponse.<List<TransactionHistoryResponse>>builder()
                .data(responses)
                .message("lấy danh sách wallet transactions của user thành công ")
                .build();
    }





}