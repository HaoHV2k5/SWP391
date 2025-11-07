package com.example.backend.service;

import com.example.backend.dto.request.AdminResolveComplaintRequest;
import com.example.backend.dto.request.ComplaintRequest;
import com.example.backend.dto.response.ComplaintResponse;
import com.example.backend.entity.Complaint;
import com.example.backend.entity.Contract;
import com.example.backend.entity.User;
import com.example.backend.enums.ComplaintStatus;
import com.example.backend.enums.ContractStatus;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.ComplaintMapper;
import com.example.backend.repository.ComplaintRepository;
import com.example.backend.repository.ContractRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ComplaintService {
    
    private final ComplaintRepository complaintRepository;
    private final ContractRepository contractRepository;
    private final UserRepository userRepository;
    private final ComplaintMapper complaintMapper;
    private final CloudinaryService cloudinaryService;
    
    /**
     * Tạo complaint mới - chỉ cho phép khi đã có giao dịch hoàn thành
     */
    @Transactional
    public ComplaintResponse createComplaint(ComplaintRequest request, Long buyerId) {
        // Lấy contract
        Contract contract = contractRepository.findById(request.getContractId())
                .orElseThrow(() -> new AppException(ErrorCode.CONTRACT_NOT_FOUND));
        
        // Lấy buyer
        User buyer = userRepository.findById(buyerId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        
        // Kiểm tra buyer có phải là buyer trong contract không
        if (contract.getBuyer().getId() != buyerId) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        
        // Kiểm tra contract đã hoàn thành chưa (status = COMPLETED và deliveryCompleted = true)
        if (contract.getStatus() == ContractStatus.COMPLETED || !contract.getDeliveryCompleted()) {
            throw new AppException(ErrorCode.CONTRACT_NOT_COMPLETED);
        }
        
        // Kiểm tra đã có complaint cho contract này chưa
        if (complaintRepository.existsByContract(contract)) {
            throw new AppException(ErrorCode.COMPLAINT_ALREADY_EXISTS);
        }
        
        // Upload evidence images nếu có
        List<String> evidenceUrls = null;
        if (request.getEvidenceImages() != null && !request.getEvidenceImages().isEmpty()) {
            evidenceUrls = new ArrayList<>();
            for (MultipartFile file : request.getEvidenceImages()) {
                String url = cloudinaryService.upload(file);
                evidenceUrls.add(url);
            }
        }
        
        // Tạo complaint
        Complaint complaint = Complaint.builder()
                .buyer(buyer)
                .seller(contract.getSeller())
                .product(contract.getProduct())
                .contract(contract)
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .evidenceUrls(evidenceUrls)
                .build();
        
        Complaint savedComplaint = complaintRepository.save(complaint);
        
        log.info("Complaint created successfully: {}", savedComplaint.getId());
        return complaintMapper.toComplaintResponse(savedComplaint);
    }
    
    /**
     * Lấy tất cả complaint của một buyer
     */
    public List<ComplaintResponse> getComplaintsByBuyer(Long buyerId) {
        User buyer = userRepository.findById(buyerId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        
        List<Complaint> complaints = complaintRepository.findByBuyer(buyer);
        return complaintMapper.toComplaintResponseList(complaints);
    }
    
    /**
     * Lấy tất cả complaint của một seller
     */
    public List<ComplaintResponse> getComplaintsBySeller(Long sellerId) {
        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        
        List<Complaint> complaints = complaintRepository.findBySeller(seller);
        return complaintMapper.toComplaintResponseList(complaints);
    }
    
    /**
     * Lấy chi tiết một complaint
     */
    public ComplaintResponse getComplaintById(Long complaintId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new AppException(ErrorCode.COMPLAINT_NOT_FOUND));
        
        return complaintMapper.toComplaintResponse(complaint);
    }
    
    /**
     * Lấy tất cả complaint (cho admin)
     */
    public List<ComplaintResponse> getAllComplaints() {
        List<Complaint> complaints = complaintRepository.findAll();
        return complaintMapper.toComplaintResponseList(complaints);
    }
    
    /**
     * Kiểm tra buyer và seller đã có giao dịch hoàn thành chưa
     */
    public boolean hasCompletedTransaction(Long buyerId, Long sellerId) {
        User buyer = userRepository.findById(buyerId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        
        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        
        return complaintRepository.hasCompletedTransaction(buyer, seller);
    }
    
    /**
     * Admin giải quyết complaint
     */
    @Transactional
    public ComplaintResponse adminResolveComplaint(Long complaintId, AdminResolveComplaintRequest request) {
        // Lấy complaint
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new AppException(ErrorCode.COMPLAINT_NOT_FOUND));
        
        // Kiểm tra complaint chưa được giải quyết
        if (complaint.getStatus() != ComplaintStatus.PENDING && complaint.getStatus() != ComplaintStatus.UNDER_REVIEW) {
            throw new AppException(ErrorCode.COMPLAINT_ALREADY_RESOLVED);
        }
        
        // Cập nhật status và staff notes
        complaint.setStatus(request.getStatus());
        complaint.setStaffNotes(request.getStaffNotes());
        
        // Nếu đã giải quyết thì set resolvedAt
        if (request.getStatus() == ComplaintStatus.RESOLVED_BUYER_FAVOR || 
            request.getStatus() == ComplaintStatus.RESOLVED_SELLER_FAVOR ||
            request.getStatus() == ComplaintStatus.CLOSED) {
            complaint.setResolvedAt(LocalDateTime.now());
        }
        
        Complaint savedComplaint = complaintRepository.save(complaint);
        
        log.info("Complaint {} resolved by admin with status: {}", complaintId, request.getStatus());
        return complaintMapper.toComplaintResponse(savedComplaint);
    }
    
    /**
     * Admin chuyển complaint sang trạng thái đang xem xét
     */
    @Transactional
    public ComplaintResponse adminStartReview(Long complaintId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new AppException(ErrorCode.COMPLAINT_NOT_FOUND));
        
        if (complaint.getStatus() != ComplaintStatus.PENDING) {
            throw new AppException(ErrorCode.COMPLAINT_NOT_PENDING);
        }
        
        complaint.setStatus(ComplaintStatus.UNDER_REVIEW);
        Complaint savedComplaint = complaintRepository.save(complaint);
        
        log.info("Complaint {} moved to UNDER_REVIEW by admin", complaintId);
        return complaintMapper.toComplaintResponse(savedComplaint);
    }
}
