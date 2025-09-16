package com.example.backend.service;

import com.example.backend.dto.request.CreationUserRequest;
import com.example.backend.dto.request.RegisterRequest;
import com.example.backend.dto.response.CreationUserResponse;
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

import java.util.List;
import java.util.function.Supplier;

@Service
@RequiredArgsConstructor

public class UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final MailService mailService;
    private String LOGIN_URL ="http://localhost:3979/login";
    public CreationUserResponse createUser(CreationUserRequest request) {
        User user = processRegister(
                request.getEmail(),
                request.getPassword(),
                request.getConfirmPassword(),
                () -> userMapper.toUser(request)
        );
        return userMapper.toCreationUserResponse(user);
    }

    public List<User> getUsers(){
        List<User> users = userRepository.findAll();
        return users;
    }



    public RegisterResponse registerUser(RegisterRequest request) {
        User user = processRegister(
                request.getEmail(),
                request.getPassword(),
                request.getConfirmPassword(),
                () -> userMapper.toUser(request)
        );
        return userMapper.toRegisterResponse(user);
    }


    private User processRegister(String email,
                                 String password,
                                 String confirmPassword,
                                 Supplier<User> userSupplier) {

        if (userRepository.existsByEmail(email)) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }
        if (!password.equals(confirmPassword)) {
            throw new AppException(ErrorCode.PASSWORD_NOT_MATCH);
        }

        User user = userSupplier.get();
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);

        try {
            mailService.sendEmail(user.getEmail(), LOGIN_URL, user.getFullname());
        } catch (MessagingException e) {
            throw new AppException(ErrorCode.EMAIL_SEND_UNSUCCESS);
        }

        return user;
    }
}
