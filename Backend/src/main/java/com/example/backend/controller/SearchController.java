package com.example.backend.controller;

import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.response.ProductResponse;
import com.example.backend.entity.Tags;
import com.example.backend.service.ProductService;
import com.example.backend.service.SearchService;
import com.example.backend.service.TagsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tag")
@RequiredArgsConstructor
public class SearchController {
    private final TagsService  tagsService;
    private final SearchService searchService;


    @GetMapping("/autocomplete")
    public ApiResponse<List<Tags>> autoComplete(@RequestParam String displayName) {
        List<Tags> list = tagsService.findAllByDisplayNameContainingIgnoreCase(displayName);
        return  ApiResponse.<List<Tags>>builder().data(list).build();
    }

    @GetMapping("/{slugs}")
    public ApiResponse<List<ProductResponse>> findBySlugs(@PathVariable String slugs) {
        List<ProductResponse> list = searchService.getProductByTagSlug(slugs);
        return  ApiResponse.<List<ProductResponse>>builder().data(list).build();
    }



}
