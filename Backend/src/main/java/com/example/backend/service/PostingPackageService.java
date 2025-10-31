package com.example.backend.service;

import com.example.backend.dto.request.CreatePostingRequest;
import com.example.backend.dto.request.UpdatePostingRequest;
import com.example.backend.dto.response.PostingPackageSimpleResponse;
import com.example.backend.entity.PostingPackage;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.PostingPackageMapper;
import com.example.backend.repository.PostingPackageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostingPackageService {
    private final PostingPackageRepository postingPackageRepository;
    private final PostingPackageMapper postingPackageMapper;

    public List<PostingPackageSimpleResponse> getAll() {
        return postingPackageRepository.findAll().stream()
                .map(postingPackageMapper::toPostingPackageSimpleResponse)
                .collect(Collectors.toList());
    }

    public PostingPackageSimpleResponse getById(Long id) {
        return postingPackageRepository.findById(id)
                .map(postingPackageMapper::toPostingPackageSimpleResponse)
                .orElse(null);
    }

    public PostingPackageSimpleResponse create(CreatePostingRequest req) {
        PostingPackage postingPackage = postingPackageMapper.toPostingPackage(req);
        PostingPackage saved = postingPackageRepository.save(postingPackage);
        return postingPackageMapper.toPostingPackageSimpleResponse(saved);
    }

    public PostingPackageSimpleResponse update(Long id, UpdatePostingRequest req) {
        PostingPackage postingPackage = postingPackageRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.POSTING_PACKAGE_NOT_FOUND));
        postingPackageMapper.updatePosting(req, postingPackage);
        postingPackage = postingPackageRepository.save(postingPackage);
        return postingPackageMapper.toPostingPackageSimpleResponse(postingPackage);



    }

    public void delete(Long id) {
        postingPackageRepository.deleteById(id);
    }
}
