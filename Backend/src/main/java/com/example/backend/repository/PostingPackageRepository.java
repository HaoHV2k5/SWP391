package com.example.backend.repository;

import com.example.backend.entity.PostingPackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostingPackageRepository extends JpaRepository<PostingPackage, Long> {
    List<PostingPackage> findByIsActiveTrue();
}
