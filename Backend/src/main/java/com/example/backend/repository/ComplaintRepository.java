package com.example.backend.repository;

import com.example.backend.entity.Complaint;
import com.example.backend.entity.Contract;
import com.example.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    
    /**
     * Tìm complaint theo buyer và seller
     */
    List<Complaint> findByBuyerAndSeller(User buyer, User seller);
    
    /**
     * Tìm complaint theo contract
     */
    Optional<Complaint> findByContract(Contract contract);
    
    /**
     * Kiểm tra xem đã có complaint nào cho contract này chưa
     */
    boolean existsByContract(Contract contract);
    
    /**
     * Tìm tất cả complaint của một buyer
     */
    List<Complaint> findByBuyer(User buyer);
    
    /**
     * Tìm tất cả complaint của một seller
     */
    List<Complaint> findBySeller(User seller);
    
    /**
     * Kiểm tra xem buyer và seller đã có giao dịch hoàn thành chưa
     * Thông qua contract với status COMPLETED và deliveryCompleted = true
     */
    @Query("SELECT COUNT(c) > 0 FROM Contract c WHERE c.buyer = :buyer AND c.seller = :seller " +
           "AND c.status = 'COMPLETED' AND c.deliveryCompleted = true")
    boolean hasCompletedTransaction(@Param("buyer") User buyer, @Param("seller") User seller);
}
