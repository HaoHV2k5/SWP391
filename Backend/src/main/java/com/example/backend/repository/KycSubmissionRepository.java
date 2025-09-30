package com.example.backend.repository;

import com.example.backend.entity.KycSubmission;
import com.example.backend.entity.User;
import com.example.backend.enums.KycStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
@Repository
public interface KycSubmissionRepository extends JpaRepository<KycSubmission, Long> {
    Optional<KycSubmission> findFirstByUserOrderByCreatedAtDesc(User user);
    List<KycSubmission> findByStatus(KycStatus status);
    List<KycSubmission> findByUserId(Long userid);

    List<KycSubmission> findAllByStatus(KycStatus status);
}


