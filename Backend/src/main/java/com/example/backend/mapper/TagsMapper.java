package com.example.backend.mapper;

import com.example.backend.dto.request.TagRequest;
import com.example.backend.dto.response.TagResponse;
import com.example.backend.entity.Tags;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface TagsMapper {
    Tags toTags(TagRequest request);

    TagResponse  toTagResponse(Tags tags);
}
