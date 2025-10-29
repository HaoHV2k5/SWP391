package com.example.backend.mapper;

import com.example.backend.dto.response.PostingPackageSimpleResponse;
import com.example.backend.entity.PostingPackage;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PostingPackageMapper {
    PostingPackageSimpleResponse toPostingPackageSimpleResponse(PostingPackage entity);
}
