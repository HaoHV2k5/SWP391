package com.example.backend.mapper;

import com.example.backend.dto.request.CreationUserRequest;
import com.example.backend.dto.request.RegisterRequest;
import com.example.backend.dto.request.UpdateUserRequest;
import com.example.backend.dto.response.CreationUserResponse;
import com.example.backend.dto.response.RegisterResponse;
import com.example.backend.dto.response.UserDetailResponse;
import com.example.backend.dto.response.UserListResponse;
import com.example.backend.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

 

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
    
    UserListResponse toUserListResponse(User user);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "username", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "email", ignore = true)
    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "verified", ignore = true)
    @Mapping(target = "locked", ignore = true)
    void updateUserFromRequest(UpdateUserRequest request, @MappingTarget User user);

}
