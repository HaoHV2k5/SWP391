package com.example.backend.mapper;

import com.example.backend.dto.request.RegisterRequest;
import com.example.backend.dto.response.RegisterResponse;
import com.example.backend.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {
    @Mapping(source = "email", target = "username")
    @Mapping(source = "email", target = "email")
    User toUser(RegisterRequest request);
    RegisterResponse toRegisterResponse(User user);
}
