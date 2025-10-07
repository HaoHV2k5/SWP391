package com.example.backend.controller;

import com.example.backend.dto.request.TagRequest;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.response.TagResponse;
import com.example.backend.service.TagsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/tag")
public class TagController {
    private final TagsService tagsService;

    @PostMapping("/create")
    public ApiResponse<TagResponse> createTag(@RequestBody TagRequest request) {
            TagResponse response = tagsService.create(request);
            return ApiResponse.<TagResponse>builder().data(response).build();


    }

}
