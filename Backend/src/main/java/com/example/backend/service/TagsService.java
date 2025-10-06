package com.example.backend.service;

import com.example.backend.dto.request.TagRequest;
import com.example.backend.dto.response.TagResponse;
import com.example.backend.entity.Tags;
import com.example.backend.mapper.TagsMapper;
import com.example.backend.repository.TagsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TagsService {
    private final TagsRepository tagsRepository;
    private final TagsMapper tagsMapper;

    public List<Tags> findAllByDisplayNameContainingIgnoreCase(String displayName) {
        List<Tags> list = tagsRepository.findTop10ByDisplayNameContainingIgnoreCase(displayName);
        return list;

    }

    public TagResponse create(TagRequest request){
        Tags tags = tagsMapper.toTags(request);
        tagsRepository.save(tags);
        return tagsMapper.toTagResponse(tags);
    }

}
