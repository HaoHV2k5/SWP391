package com.example.backend.repository;

import com.example.backend.entity.UserPostingPackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserPostingPackageRepository extends JpaRepository<UserPostingPackage, Long> {
}
