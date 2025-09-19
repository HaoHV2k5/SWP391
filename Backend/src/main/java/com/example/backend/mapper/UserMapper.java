package com.example.backend.mapper;

import com.example.backend.dto.request.CreationUserRequest;
import com.example.backend.dto.request.RegisterRequest;
import com.example.backend.dto.response.CreationUserResponse;
import com.example.backend.dto.response.RegisterResponse;
import com.example.backend.dto.response.UserDetailResponse;
import com.example.backend.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

 

@Mapper(componentModel = "spring")
public interface UserMapper {
    @Mapping(source = "email", target = "username")
    @Mapping(source = "email", target = "email")
    User toUser(CreationUserRequest request);
    CreationUserResponse toCreationUserResponse(User user);

    @Mapping(source = "email", target = "username")
    @Mapping(source = "email", target = "email")
    User toUser(RegisterRequest request);
    RegisterResponse toRegisterResponse(User user);


    UserDetailResponse toUserDetailResponse(User user);



}
