package com.example.backend.mapper;

import com.example.backend.dto.request.CreatePostingRequest;
import com.example.backend.dto.request.UpdatePostingRequest;
import com.example.backend.dto.response.PostingPackageSimpleResponse;
import com.example.backend.entity.PostingPackage;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface PostingPackageMapper {
    PostingPackageSimpleResponse toPostingPackageSimpleResponse(PostingPackage entity);
    PostingPackage toPostingPackage(CreatePostingRequest entity);
    void updatePosting(UpdatePostingRequest req, @MappingTarget PostingPackage entity);
}
