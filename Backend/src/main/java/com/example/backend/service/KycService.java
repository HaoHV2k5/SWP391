package com.example.backend.service;

import com.example.backend.dto.request.KycDecisionRequest;
import com.example.backend.dto.response.KycDetailResponse;
import com.example.backend.dto.response.UserDetailResponse;
import com.example.backend.entity.KycSubmission;
import com.example.backend.entity.Role;
import com.example.backend.entity.User;
import com.example.backend.enums.KycStatus;
import com.example.backend.enums.Roles;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.UserMapper;
import com.example.backend.repository.KycSubmissionRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class KycService {
    private final KycSubmissionRepository kycSubmissionRepository;
    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;
    private final UserMapper userMapper;


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

    public KycDetailResponse staffApprove(Long kycId){
        KycSubmission sub = kycSubmissionRepository.findById(kycId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        User user = sub.getUser();
        List<KycSubmission> kycApproved = kycSubmissionRepository.findByUserId(user.getId());
        if(!kycApproved.isEmpty()){
            kycApproved.forEach(kyc -> {kyc.setStatus(KycStatus.PENDING);});

        }
        sub.setStatus(KycStatus.STAFF_APPROVED);
        sub.setRejectionReason(null);

        return toResponse(kycSubmissionRepository.save(sub));
    }

    public KycDetailResponse adminApprove(Long kycId){
        KycSubmission sub = kycSubmissionRepository.findById(kycId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        sub.setStatus(KycStatus.ADMIN_APPROVED);
        User user =  sub.getUser();
        Role sellerRole = new Role();
        sellerRole.setName(Roles.SELLER.name());
        user.setRoles(Set.of(sellerRole));
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



    public List<KycDetailResponse> getAllKycByStaff(){
        List<KycSubmission> subs = kycSubmissionRepository.findByStatus(KycStatus.PENDING);
        List<KycDetailResponse> response = new ArrayList<>();
        for(KycSubmission sub : subs){
            response.add(toResponse(sub));
        }

        return response;
    }




    public List<KycDetailResponse> getAllKycByAdmin(){
        List<KycSubmission> subs = kycSubmissionRepository.findByStatus(KycStatus.STAFF_APPROVED);
        List<KycDetailResponse> response = new ArrayList<>();
        for(KycSubmission sub : subs){
            response.add(toResponse(sub));
        }

        return response;
    }


    public KycDetailResponse getKYCUsing(Long id){
        User user = userRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        KycSubmission subs = kycSubmissionRepository.findFirstByUserOrderByCreatedAtDesc(user).orElseThrow(() -> new AppException(ErrorCode.KYC_NOT_EXISTED));


        return toResponse(subs);
    }

    public UserDetailResponse getInforUserById(Long id){
        KycSubmission kyc = kycSubmissionRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.KYC_NOT_EXISTED));
        User user = kyc.getUser();
        return userMapper.toUserDetailResponse(user);
    }
}


