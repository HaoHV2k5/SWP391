package com.example.backend.repository;

import com.example.backend.entity.Contract;
import com.example.backend.enums.ContractStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContractRepository extends JpaRepository<Contract, Long> {
    Contract findByContractCode(String contractCode);

    @Query("select p from Contract p where p.buyer.id = ?1 or p.seller.id = ?1")
    List<Contract> findAllByUserInvolved(Long sellerId);

    @Query("select p from Contract  p where (p.seller.id = ?1 or p.buyer.id = ?1) and p.status = ?2 ")
    List<Contract> findAllConstractByStatus(long userId, ContractStatus status);

}
