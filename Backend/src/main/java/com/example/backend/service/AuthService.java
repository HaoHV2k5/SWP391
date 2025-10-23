package com.example.backend.service;

import com.example.backend.dto.request.IntrospectRequest;
import com.example.backend.dto.request.LoginRequest;
import com.example.backend.dto.request.RefreshRequest;
import com.example.backend.dto.request.FirebaseUserRequest;
import com.example.backend.dto.response.IntrospectResponse;
import com.example.backend.dto.response.LoginResponse;
import com.example.backend.dto.response.RefreshResponse;
import com.example.backend.entity.User;
import com.example.backend.entity.Role;
import com.example.backend.enums.Roles;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.UserMapper;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.RoleRepository;
import com.nimbusds.jose.*;

import com.nimbusds.jwt.SignedJWT;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.text.ParseException;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.Optional;


@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final JwtService jwtService;
    private final UserMapper userMapper;
    private final UserService userService;
    @Value("${jwt.secret}")
    private  String jwtSecret;
    @Value("${password.secrect}")
    private String passwordUser;
    @Value("${email.login.facebook}")
    private String emailLoginFacebook;

    public LoginResponse login(LoginRequest loginRequest) {
        // Hardcode admin login
//        if ("admin@electricrade.com".equals(loginRequest.getUsername()) && "admin123".equals(loginRequest.getPassword())) {
//            // Tạo admin user tạm thời
//            User adminUser = new User();
//            adminUser.setId(999L);
//            adminUser.setEmail("admin@electricrade.com");
//            adminUser.setFullname("Administrator");
//            adminUser.setVerified(true);
//            adminUser.setLocked(false);
//
//            String token = jwtService.generateToken(adminUser);
//            String refreshToken = jwtService.generateRefreshToken(adminUser);
//
//            return LoginResponse.builder().authenticated(true).token(token).refreshToken(refreshToken).build();
//        }

        // Tìm user bằng email (vì admin tạo user với email)
        User user = userRepository.findByEmail(loginRequest.getUsername())
                .orElseThrow( () -> new AppException(ErrorCode.USER_NOT_EXISTED));
        if(user.isLocked()){
            throw new AppException(ErrorCode.ACCOUNT_LOCKED);
        }
        if(!user.isVerified()){
            throw new AppException(ErrorCode.OTP_NOT_VERIFY);
        }
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
        boolean auth = passwordEncoder.matches(loginRequest.getPassword(), user.getPassword());
        if(!auth){
            throw  new AppException(ErrorCode.LOGIN_FAIL);
        }
        String token = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        return LoginResponse.builder()
                .authenticated(true)
                .token(token)
                .refreshToken(refreshToken)
                .user(userMapper.toUserDetailResponse(user))
                .build();
    }



    public IntrospectResponse introspectToken(IntrospectRequest request){
        String token = request.getToken();
        boolean isValid = true;

        try {
            jwtService.verifyJwt(token);
        } catch (Exception e) {
            isValid = false;
        }
        return IntrospectResponse.builder().authenticated(isValid).build();

    }




    public Map<String,Object> googleLogin(OAuth2AuthenticationToken auth){
        OAuth2User oAuth2User = auth.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String picture = "";
        String provider = null;
        provider = auth.getAuthorizedClientRegistrationId(); // gg or fb


        if(email == null ){
           throw new AppException(ErrorCode.EMAIL_NULL);

        }

            if ("facebook".equalsIgnoreCase(provider)) {
                Map<String, Object> pictureObj = oAuth2User.getAttribute("picture");
                if (pictureObj != null && pictureObj.get("data") != null) {
                    Map<String, Object> data = (Map<String, Object>) pictureObj.get("data");
                    picture = (String) data.get("url");
                }
            } else if ("google".equalsIgnoreCase(provider)) {
                picture = oAuth2User.getAttribute("picture");
            } else {
                // fallback cho các provider khác (github, linkedin, ...)
                picture = oAuth2User.getAttribute("avatar_url");
            }

        Map<String,Object> map = new HashMap<>();
        map.put("email",email);
        map.put("name",name);
        map.put("picture",picture);

        // Tìm user đã tồn tại hoặc tạo mới
        var existingUser = userRepository.findByEmail(email);
        User user;

        if(existingUser.isPresent()){
            // User đã tồn tại, cho phép đăng nhập
            if(existingUser.get().getPassword().equals(passwordUser)){
                user = existingUser.get();
            }else {
                throw  new AppException(ErrorCode.ACCOUNT_EXISTED);
            }

        } else {
            // Tạo user mới
            user = new User();
            user.setUsername(email);
            user.setEmail(email);
            user.setFullname(name);

            user.setAvatar(picture);
            user.setPassword(passwordUser); // Google user không cần password
            user.setVerified(true); // Google user đã verified
            user.setLocked(false);

            // Set role member cho Google user
            HashSet<Role> roles = new HashSet<>();
            roleRepository.findById(Roles.USER.name()).ifPresent(roles::add);
            //Role userRole = roleRepository.findById("USER").orElseThrow(() -> new AppException(ErrorCode.USER_ROLE_NOT_FOUND));
            user.setRoles(roles);

            userRepository.save(user);
            userService.initWalletAndWishlist(user);
        }

        String token = jwtService.generateToken(user);
        map.put("token",token);
        String refreshToken = jwtService.generateRefreshToken(user);
        map.put("refreshToken",refreshToken);
        return map;
    }



    public RefreshResponse refresh(RefreshRequest request) throws ParseException, JOSEException {
        String refreshToken = request.getRefreshToken();
        SignedJWT signedJWT = null;
        try{
            signedJWT  = jwtService.verifyJwt(refreshToken);

        }catch (Exception e){
            throw  new AppException(ErrorCode.UNAUTHORIZED);
        }

        String userName = signedJWT.getJWTClaimsSet().getSubject();
        User user = userRepository.findByUsername(userName).orElseThrow(()  -> new AppException(ErrorCode.USER_NOT_EXISTED));
        String token = jwtService.generateToken(user);
        String refresh = jwtService.generateRefreshToken(user);

        return RefreshResponse.builder().token(token).refreshToken(refresh).build();

    }

    // Firebase Authentication methods
    public LoginResponse syncFirebaseUser(FirebaseUserRequest request) {
        log.info("Syncing Firebase user: {}", request.getEmail());
        
        // Tìm user theo Firebase UID hoặc email
        Optional<User> existingUser = userRepository.findByEmail(request.getEmail());
        User user;
        
        if (existingUser.isPresent()) {
            // User đã tồn tại, cập nhật thông tin Firebase
            user = existingUser.get();
            user.setFirebaseUid(request.getFirebaseUid());
            user.setAvatar(request.getAvatar());
            user.setVerified(true); // Firebase user đã verified
            userRepository.save(user);
            log.info("Updated existing user with Firebase info: {}", user.getEmail());
        } else {
            // Tạo user mới từ Firebase
            user = createFirebaseUser(request);
            log.info("Created new Firebase user: {}", user.getEmail());
        }
        
        // Tạo JWT token
        String token = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
        
        return LoginResponse.builder()
                .authenticated(true)
                .token(token)
                .refreshToken(refreshToken)
                .user(userMapper.toUserDetailResponse(user))
                .build();
    }
    
    public LoginResponse registerFirebaseUser(FirebaseUserRequest request) {
        log.info("Registering new Firebase user: {}", request.getEmail());
        
        // Kiểm tra user đã tồn tại chưa
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new AppException(ErrorCode.ACCOUNT_EXISTED);
        }
        
        // Tạo user mới
        User user = createFirebaseUser(request);
        
        // Tạo JWT token
        String token = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
        
        return LoginResponse.builder()
                .authenticated(true)
                .token(token)
                .refreshToken(refreshToken)
                .user(userMapper.toUserDetailResponse(user))
                .build();
    }
    
    public Map<String, Object> checkUserExists(String firebaseUid) {
        Map<String, Object> result = new HashMap<>();
        
        Optional<User> user = userRepository.findByFirebaseUid(firebaseUid);
        if (user.isPresent()) {
            result.put("exists", true);
            result.put("user", userMapper.toUserDetailResponse(user.get()));
        } else {
            result.put("exists", false);
        }
        
        return result;
    }
    
    private User createFirebaseUser(FirebaseUserRequest request) {
        User user = new User();
        user.setUsername(request.getEmail());
        user.setEmail(request.getEmail());
        user.setFullname(request.getFullName());
        user.setAvatar(request.getAvatar());
        user.setFirebaseUid(request.getFirebaseUid());
        user.setPassword(passwordUser); // Firebase user không cần password
        user.setVerified(true); // Firebase user đã verified
        user.setLocked(false);
        
        // Set role member cho Firebase user
        HashSet<Role> roles = new HashSet<>();
        roleRepository.findById(Roles.USER.name()).ifPresent(roles::add);
        user.setRoles(roles);
        
        user = userRepository.save(user);
        userService.initWalletAndWishlist(user);
        
        return user;
    }


}