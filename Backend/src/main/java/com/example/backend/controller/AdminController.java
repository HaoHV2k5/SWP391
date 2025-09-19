package com.example.backend.controller;

import com.example.backend.dto.request.AdminUpdateUserRequest;
import com.example.backend.dto.request.CreationUserRequest;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.response.CreationUserResponse;
import com.example.backend.dto.response.UserDetailResponse;
import com.example.backend.entity.User;
import com.example.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin")
@Slf4j
public class AdminController {
    private final UserService userService;
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



    @PostMapping("/users/{id}/lock")
    public ApiResponse<UserDetailResponse> lockUser(@PathVariable("id") Long id){
        UserDetailResponse updated = userService.lockUserDetail(id);
        return ApiResponse.<UserDetailResponse>builder().data(updated).message("User account locked").build();
    }

    @PostMapping("/users/{id}/unlock")
    public ApiResponse<UserDetailResponse> unlockUser(@PathVariable("id") Long id){
        UserDetailResponse updated = userService.unlockUserDetail(id);
        return ApiResponse.<UserDetailResponse>builder().data(updated).message("User account unlocked").build();
    }

    // Delete a user
    @DeleteMapping("/users/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)//HttpStatus.NO_CONTENT = 204 nghĩa là request thành công nhưng server không trả nội dung nào
    public ApiResponse<Void> deleteUser(@PathVariable("id") Long id){
        userService.deleteUser(id);
        return ApiResponse.<Void>builder()
                .message("User deleted successfully")
                .build();
    }
}
