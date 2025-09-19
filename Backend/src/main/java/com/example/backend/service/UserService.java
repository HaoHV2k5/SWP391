package com.example.backend.service;

import com.example.backend.dto.request.AdminUpdateUserRequest;
import com.example.backend.dto.request.CreationUserRequest;
import com.example.backend.dto.request.RegisterRequest;
import com.example.backend.dto.response.CreationUserResponse;
import com.example.backend.dto.response.UserDetailResponse;
import com.example.backend.entity.Role;
import com.example.backend.entity.User;
import com.example.backend.enums.Roles;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.repository.RoleRepository;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import com.example.backend.mapper.UserMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.example.backend.repository.UserRepository;

import java.util.*;
import java.util.function.Supplier;

@Service
@RequiredArgsConstructor

public class UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final MailService mailService;
    private final RoleRepository roleRepository;
 

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
        List<User> listUsers = userRepository.findAll();
        return listUsers;
    }

    public User lockUser(Long userId){
        User user = userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        user.setLocked(true);
        return userRepository.save(user);
    }

    public User unlockUser(Long userId){
        User user = userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        user.setLocked(false);
        return userRepository.save(user);
    }

    public UserDetailResponse lockUserDetail(Long userId){
        User saved = lockUser(userId);
        return userMapper.toUserDetailResponse(saved);
    }

    public UserDetailResponse unlockUserDetail(Long userId){
        User saved = unlockUser(userId);
        return userMapper.toUserDetailResponse(saved);
    }

    public User registerUser(RegisterRequest request) {
        User user = processRegister(
                request.getEmail(),
                request.getPassword(),
                request.getConfirmPassword(),
                () -> userMapper.toUser(request)
        );
        return user;
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
        HashSet<Role> roles = new HashSet<>();
        roleRepository.findById(Roles.USER.name()).ifPresent(roles::add);
        user.setRoles(roles);
        userRepository.save(user);

        try {
            mailService.sendEmail(user.getEmail(), LOGIN_URL, user.getFullname());
        } catch (MessagingException e) {
            throw new AppException(ErrorCode.EMAIL_SEND_UNSUCCESS);
        }

        return user;
    }

    public User getUser(String email){
        User user = userRepository.findByEmail(email).orElseThrow(() -> new AppException(ErrorCode.USER_EXISTED));
        return user;
    }

    public UserDetailResponse getUserById(long id){
        User user = userRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        return userMapper.toUserDetailResponse(user);
    }

//    public UserDetailResponse UpdateUserbyAdmin(long id, AdminUpdateUserRequest request){
//        User user = userRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
//
//
//    }

    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        userRepository.delete(user);
    }
}
