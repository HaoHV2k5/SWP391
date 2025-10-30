package com.example.backend.service;

import com.example.backend.dto.response.PostingPackageSimpleResponse;
import com.example.backend.entity.PostingPackage;
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

    public PostingPackageSimpleResponse create(PostingPackage req) {
        PostingPackage saved = postingPackageRepository.save(req);
        return postingPackageMapper.toPostingPackageSimpleResponse(saved);
    }

    public PostingPackageSimpleResponse update(Long id, PostingPackage req) {
        return postingPackageRepository.findById(id)
                .map(pkg -> {
                    pkg.setName(req.getName());
                    pkg.setDescription(req.getDescription());
                    pkg.setPrice(req.getPrice());
                    pkg.setDuration(req.getDuration());
                    pkg.setPostLimit(req.getPostLimit());
                    pkg.setIsActive(req.getIsActive());
                    pkg.setRequireApproval(req.getRequireApproval());
                    PostingPackage updated = postingPackageRepository.save(pkg);
                    return postingPackageMapper.toPostingPackageSimpleResponse(updated);
                })
                .orElse(null);
    }

    public void delete(Long id) {
        postingPackageRepository.deleteById(id);
    }
}
