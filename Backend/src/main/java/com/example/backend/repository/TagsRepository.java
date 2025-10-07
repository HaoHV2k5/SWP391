package com.example.backend.repository;

import com.example.backend.entity.Tags;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TagsRepository extends JpaRepository<Tags, Long> {
    List<Tags> findTop10ByDisplayNameContainingIgnoreCase(String displayName);

    Optional<Tags> findBySlugs(String slug);
}
