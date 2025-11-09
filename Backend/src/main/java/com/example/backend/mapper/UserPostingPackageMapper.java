package com.example.backend.mapper;

import com.example.backend.dto.response.PostingPackageResponse;
import com.example.backend.entity.UserPostingPackage;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserPostingPackageMapper {

    @Mapping(target = "description" , source = "postingPackage.description")
    @Mapping(target = "name" , source = "postingPackage.name")
    @Mapping(target = "price" , source = "postingPackage.price")
    @Mapping(target = "duration" , source = "postingPackage.duration")
    @Mapping(target = "requireApproval" , source = "postingPackage.requireApproval")


    PostingPackageResponse toPostingPackageResponse(UserPostingPackage userPostingPackage);
}
