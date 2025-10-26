package com.example.backend.repository;

import com.example.backend.entity.OrderEscrow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderEscrowRepository extends JpaRepository<OrderEscrow, Long> {
}
