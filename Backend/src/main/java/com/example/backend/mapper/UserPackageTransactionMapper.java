package com.example.backend.mapper;

import com.example.backend.dto.response.PackageBuyHistoryResponse;
import com.example.backend.dto.response.UserPackageTransactionResponse;
import com.example.backend.entity.UserPostingPackage;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UserPackageTransactionMapper {
    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "postingPackage.id", target = "packageId")

    UserPackageTransactionResponse toUserPackageTransactionResponses(UserPostingPackage  userPostingPackage);

    List<UserPackageTransactionResponse>  toUserPackageTransactionResponsesList(List<UserPostingPackage> userPostingPackages);
    @Mapping(target = "name", source = "postingPackage.name")
    @Mapping(target = "description", source = "postingPackage.description")
    @Mapping(target = "price", source = "postingPackage.price")

    @Mapping(target = "postLimit", source = "postingPackage.price")

    PackageBuyHistoryResponse toPackageBuyHistoryResponses(UserPostingPackage userPostingPackage);

    List<PackageBuyHistoryResponse>  toPackageBuyHistoryResponsesList(List<UserPostingPackage> userPostingPackages);

}
