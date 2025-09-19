package com.example.backend.mapper;

import com.example.backend.dto.request.AdminUpdateUserRequest;
import com.example.backend.dto.request.CreationUserRequest;
import com.example.backend.dto.request.RegisterRequest;
import com.example.backend.dto.response.CreationUserResponse;
import com.example.backend.dto.response.RegisterResponse;
import com.example.backend.dto.response.UserAfterUpdateResponse;
import com.example.backend.dto.response.UserDetailResponse;
import com.example.backend.entity.User;
import org.mapstruct.*;


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
    UserAfterUpdateResponse toUserAfterUpdateResponse(User user);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE) //bỏ qua những trường giá trị null thì trong database sẽ lấy giá trị cũ
    @Mapping(target = "email", ignore = true) // Không cho update email dù có truyền hay không
    void updateUserFromRequest(AdminUpdateUserRequest request, @MappingTarget User user);

    // Điều kiện: chỉ map nếu String không rỗng
    @Condition
    default boolean isNotBlank(String value) {
        return value != null && !value.trim().isEmpty();
    }
}
