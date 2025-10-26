//package com.example.backend.service;
//
//import com.google.firebase.auth.FirebaseAuth;
//import com.google.firebase.auth.FirebaseToken;
//import com.google.firebase.auth.UserRecord;
//import com.example.backend.entity.User;
//import com.example.backend.entity.Role;
//import com.example.backend.repository.UserRepository;
//import com.example.backend.repository.RoleRepository;
//import com.example.backend.enums.Roles;
//import com.example.backend.mapper.UserMapper;
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.stereotype.Service;
//
//import java.util.HashSet;
//import java.util.Optional;
//
//// Tạm thời comment FirebaseAuthService để backend có thể start
///*
//@Service
//@RequiredArgsConstructor
//@Slf4j
//public class FirebaseAuthService {
//
//    private final UserRepository userRepository;
//    private final RoleRepository roleRepository;
//    private final UserMapper userMapper;
//    private final UserService userService;
//
//    // Validate Firebase token và trả về User
//    public User validateFirebaseToken(String firebaseToken) {
//        try {
//            log.info("Validating Firebase token...");
//
//            // Verify Firebase token
//            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(firebaseToken);
//            String uid = decodedToken.getUid();
//            String email = decodedToken.getEmail();
//            String name = decodedToken.getName();
//            String picture = decodedToken.getPicture();
//
//            log.info("Firebase token validated for user: {}", email);
//
//            // Tìm user trong database
//            Optional<User> existingUser = userRepository.findByEmail(email);
//
//            if (existingUser.isPresent()) {
//                // User đã tồn tại, cập nhật Firebase UID
//                User user = existingUser.get();
//                user.setFirebaseUid(uid);
//                user.setAvatar(picture);
//                user.setVerified(true);
//                userRepository.save(user);
//
//                log.info("Updated existing user with Firebase UID: {}", email);
//                return user;
//            } else {
//                // Tạo user mới từ Firebase
//                User newUser = createFirebaseUser(decodedToken);
//                log.info("Created new Firebase user: {}", email);
//                return newUser;
//            }
//
//        } catch (Exception e) {
//            log.error("Error validating Firebase token: {}", e.getMessage());
//            throw new RuntimeException("Invalid Firebase token");
//        }
//    }
//
//    // Tạo user mới từ Firebase token
//    private User createFirebaseUser(FirebaseToken decodedToken) {
//        User user = new User();
//        user.setUsername(decodedToken.getEmail());
//        user.setEmail(decodedToken.getEmail());
//        user.setFullname(decodedToken.getName());
//        user.setAvatar(decodedToken.getPicture());
//        user.setFirebaseUid(decodedToken.getUid());
//        user.setPassword("firebase_user"); // Password không quan trọng cho Firebase user
//        user.setVerified(true);
//        user.setLocked(false);
//
//        // Set role member
//        HashSet<Role> roles = new HashSet<>();
//        roleRepository.findById(Roles.USER.name()).ifPresent(roles::add);
//        user.setRoles(roles);
//
//        user = userRepository.save(user);
//        userService.initWalletAndWishlist(user);
//
//        return user;
//    }
//
//    // Kiểm tra user có tồn tại với Firebase UID không
//    public Optional<User> findByFirebaseUid(String firebaseUid) {
//        return userRepository.findByFirebaseUid(firebaseUid);
//    }
//}
//*/
