package com.example.backend.service;

import com.example.backend.dto.request.RegisterRequest;
import com.example.backend.dto.response.RegisterResponse;
import com.example.backend.entity.User;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import com.example.backend.mapper.UserMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.example.backend.repository.UserRepository;

@Service
@RequiredArgsConstructor

public class UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final MailService mailService;
    private String LOGIN_URL ="http://localhost:3979/login";
    public RegisterResponse createUser(RegisterRequest request){
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }
        if (!request.getPassword().equals(request.getConfirmPassword())){
            throw new AppException(ErrorCode.PASSWORD_NOT_MATCH);
        }
        User user = userMapper.toUser(request);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
        try {
            mailService.sendEmail(user.getEmail(), LOGIN_URL ,user.getFullname());
        } catch (MessagingException e) {
            throw new AppException(ErrorCode.EMAIL_SEND_UNSUCCESS);
        }
        return userMapper.toRegisterResponse(user);

    }

}
