package com.example.backend.repository;

import com.example.backend.dto.response.WalletTransactionResponse;
import com.example.backend.entity.WalletTransaction;
import com.example.backend.enums.WalletTransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, Long> {
    Optional<WalletTransaction> findByTransactionCode(String txnRef );

    List<WalletTransaction> findByTypeWalletTraction(WalletTransactionType typeWalletTraction);
    @Query("select p from WalletTransaction p where p.wallet.id = ?1")
    List<WalletTransaction> findbyWalletid( Long walletId);

}
