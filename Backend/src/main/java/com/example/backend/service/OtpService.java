package com.example.backend.service;

import com.example.backend.entity.User;
import com.example.backend.entity.UserOtp;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.repository.UserOtpRepository;
import com.example.backend.repository.UserRepository;
import jakarta.mail.MessagingException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class OtpService {
    private final UserRepository  userRepository;
    private final UserOtpRepository userOtpRepository;
    private final MailService mailService;



    @Transactional
    public void generateOtpCode(User user) {
        userOtpRepository.invalidateAllByUserID(user.getId());
        int number = 100000 + new Random().nextInt(900000) ; // sinh ra so 0 -> 89999 -> +100000 -> 6 so
        String otp = String.valueOf(number);
        UserOtp userOtp = new UserOtp();
        userOtp.setUser(user);
        userOtp.setOtpCode(otp);
        userOtp.setExpiredAt(LocalDateTime.now().plusMinutes(5));
        userOtpRepository.save(userOtp);

        try {
            mailService.sendOTP(user.getEmail(),user.getFullname(), otp);
        } catch (MessagingException e) {
            throw new AppException(ErrorCode.EMAIL_SEND_UNSUCCESS);
        }


    }

    @Transactional
    public boolean verifyOtpCode(User user, String otpCode) {
        Optional<UserOtp> userOtpOpt = userOtpRepository.findValidOtp(
                user.getId(), otpCode, LocalDateTime.now());

        if (userOtpOpt.isEmpty()) return false;

        UserOtp otp = userOtpOpt.get();
        otp.setUsed(true);
        userOtpRepository.save(otp);

        user.setVerified(true);
        userRepository.save(user);
        return true;



    }




}
