package com.example.backend.controller;

import com.example.backend.dto.request.CreationUserRequest;
import com.example.backend.dto.request.RegisterRequest;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.response.CreationUserResponse;
import com.example.backend.dto.response.RegisterResponse;
import com.example.backend.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import com.example.backend.service.UserService;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin")
@Slf4j
public class UserController {
    private final UserService userService;
//    @PostMapping("/register")
//    public ApiResponse<RegisterResponse> register(@RequestBody @Valid  RegisterRequest request){
//
//        RegisterResponse registerResponse = userService.createUser(request);
//        return ApiResponse.<RegisterResponse>builder().data(registerResponse).build();
//    }


    @GetMapping("/users")
    public ApiResponse<List<User>> getUsers(){
        List<User> users = userService.getUsers();
        return ApiResponse.<List<User>>builder()
                .data(users)
                .build();
    }

    @PostMapping("/createUser")
    public ApiResponse<CreationUserResponse> register(@RequestBody @Valid CreationUserRequest request){

        CreationUserResponse creationUserResponse = userService.createUser(request);
        return ApiResponse.<CreationUserResponse>builder().data(creationUserResponse).build();
    }

}
