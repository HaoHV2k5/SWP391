package com.example.backend.service;

import com.example.backend.dto.request.CreationUserRequest;
import com.example.backend.dto.request.RegisterRequest;
import com.example.backend.dto.request.UpdateUserRequest;
import com.example.backend.dto.request.UpdateUserRoleRequest;
import com.example.backend.dto.response.CreationUserResponse;
import com.example.backend.dto.response.UserDetailResponse;
import com.example.backend.dto.response.UserListResponse;
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
        user.setVerified(true); // Set user được verify khi admin tạo
        HashSet<Role> roles = new HashSet<>();
        roleRepository.findById(Roles.USER.name()).ifPresent(roles::add);
        user.setRoles(roles);
        userRepository.save(user);

        // Không gửi email ở đây, để OtpService gửi OTP
        // try {
        //     mailService.sendEmail(user.getEmail(), LOGIN_URL, user.getFullname());
        // } catch (MessagingException e) {
        //     throw new AppException(ErrorCode.EMAIL_SEND_UNSUCCESS);
        // }

        return user;
    }

    public User getUser(String email){
        User user = userRepository.findByEmail(email).orElseThrow(() -> new AppException(ErrorCode.USER_EXISTED));


        return user;

    }

    public User getUserByUsername(String username){
        User user = userRepository.findByUsername(username).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        return user;
    }

    public UserDetailResponse getUserDetailByUsername(String username){
        User user = getUserByUsername(username);
        return userMapper.toUserDetailResponse(user);
    }

    // Admin CRUD operations
    public UserListResponse getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        return userMapper.toUserListResponse(user);
    }

    public List<UserListResponse> getAllUsers() {
        List<User> users = userRepository.findAll();
        return users.stream()
                .map(userMapper::toUserListResponse)
                .toList();
    }

    public UserListResponse updateUser(Long userId, UpdateUserRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        
        userMapper.updateUserFromRequest(request, user);
        User savedUser = userRepository.save(user);
        return userMapper.toUserListResponse(savedUser);
    }

    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        userRepository.delete(user);
    }

    public UserListResponse updateUserRoles(UpdateUserRoleRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        
        Set<Role> newRoles = new HashSet<>();
        for (String roleName : request.getRoleNames()) {
            Role role = roleRepository.findById(roleName)
                    .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_EXISTED));
            newRoles.add(role);
        }
        
        user.setRoles(newRoles);
        User savedUser = userRepository.save(user);
        return userMapper.toUserListResponse(savedUser);
    }

    public UserListResponse verifyUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        user.setVerified(true);
        User savedUser = userRepository.save(user);
        return userMapper.toUserListResponse(savedUser);
    }

    public UserListResponse unverifyUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        user.setVerified(false);
        User savedUser = userRepository.save(user);
        return userMapper.toUserListResponse(savedUser);
    }


}
