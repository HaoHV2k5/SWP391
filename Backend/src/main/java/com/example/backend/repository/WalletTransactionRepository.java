package com.example.backend.repository;

import com.example.backend.entity.WalletTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, Long> {
    Optional<WalletTransaction> findByTransactionCode(String txnRef );


}
