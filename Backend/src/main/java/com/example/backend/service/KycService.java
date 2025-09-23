package com.example.backend.service;

import com.example.backend.dto.request.KycDecisionRequest;
import com.example.backend.dto.response.KycDetailResponse;
import com.example.backend.entity.KycSubmission;
import com.example.backend.entity.User;
import com.example.backend.enums.KycStatus;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.repository.KycSubmissionRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class KycService {
    private final KycSubmissionRepository kycSubmissionRepository;
    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;

    public KycDetailResponse submit(Long userId, MultipartFile frontImage, MultipartFile backImage){
        User user = userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        String frontUrl = cloudinaryService.upload(frontImage);
        String backUrl = cloudinaryService.upload(backImage);

        KycSubmission sub = new KycSubmission();
        sub.setUser(user);
        sub.setFrontImageUrl(frontUrl);
        sub.setBackImageUrl(backUrl);
        sub.setStatus(KycStatus.PENDING);
        KycSubmission saved = kycSubmissionRepository.save(sub);
        return toResponse(saved);
    }
//    @PreAuthorize("hasAuthority('APPROVE')")
    public KycDetailResponse approve(Long kycId){
        KycSubmission sub = kycSubmissionRepository.findById(kycId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        sub.setStatus(KycStatus.APPROVED);
        sub.setRejectionReason(null);
        return toResponse(kycSubmissionRepository.save(sub));
    }

    public KycDetailResponse reject(Long kycId, KycDecisionRequest request){
        KycSubmission sub = kycSubmissionRepository.findById(kycId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        sub.setStatus(KycStatus.REJECTED);
        sub.setRejectionReason(request.getReason());
        return toResponse(kycSubmissionRepository.save(sub));
    }

    private KycDetailResponse toResponse(KycSubmission sub){
        return KycDetailResponse.builder()
                .id(sub.getId())
                .userId(sub.getUser().getId())
                .frontImageUrl(sub.getFrontImageUrl())
                .backImageUrl(sub.getBackImageUrl())
                .status(sub.getStatus())
                .rejectionReason(sub.getRejectionReason())
                .createdAt(sub.getCreatedAt())
                .updatedAt(sub.getUpdatedAt())
                .build();
    }
}


