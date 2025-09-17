package com.example.backend.repository;

import com.example.backend.entity.UserOtp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface UserOtpRepository extends JpaRepository<UserOtp,String> {
    @Modifying
    @Query("update UserOtp  o SET o.used = true WHERE o.user.id = :Userid AND o.used = false")
    void invalidateAllByUserID(@Param(("Userid")) long userID);

    @Query("select o from UserOtp o where  o.user.id = :Userid and o.otpCode = :code and o.used = false and o.expiredAt > :now")
    Optional<UserOtp> findValidOtp(@Param(("Userid")) long userID,
                                   @Param(("code")) String otpCode,
                                   @Param(("now"))LocalDateTime now);

}
