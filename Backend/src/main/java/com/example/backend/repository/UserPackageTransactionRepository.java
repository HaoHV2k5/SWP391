package com.example.backend.repository;

import com.example.backend.entity.PostingPackage;
import com.example.backend.entity.UserPostingPackage;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserPackageTransactionRepository extends JpaRepository<UserPostingPackage, Long> {

    List<UserPostingPackage> findByUserId(Long userId);
    UserPostingPackage findPostingPackageByUserIdAndActiveTrue(Long userId);

    @EntityGraph(attributePaths = {"postingPackage", "user"})
    List<UserPostingPackage> findByActiveTrueAndPostingPackageRequireApprovalTrue();
}
