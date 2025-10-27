package com.example.backend.mapper;

import com.example.backend.dto.response.ReviewResponse;
import com.example.backend.entity.Review;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ReviewMapper {
    
    @Mapping(source = "reviewer.id", target = "reviewerId")
    @Mapping(source = "reviewer.fullname", target = "reviewerName")
    @Mapping(source = "reviewer.avatar", target = "reviewerAvatar")
    @Mapping(source = "reviewee.id", target = "revieweeId")
    @Mapping(source = "reviewee.fullname", target = "revieweeName")
    ReviewResponse toReviewResponse(Review review);
}
