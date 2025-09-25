package com.example.backend.service;

import com.example.backend.dto.request.IntrospectRequest;
import com.example.backend.dto.request.LoginRequest;
import com.example.backend.dto.request.RefreshRequest;
import com.example.backend.dto.response.IntrospectResponse;
import com.example.backend.dto.response.LoginResponse;
import com.example.backend.dto.response.RefreshResponse;
import com.example.backend.entity.User;
import com.example.backend.entity.Role;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
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
import java.util.Map;
import java.util.Set;
 

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final JwtService jwtService;
    @Value("${jwt.secret}")
    private  String jwtSecret;


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
            throw  new AppException(ErrorCode.UNAUTHENTICATED);
        }
        String token = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        return LoginResponse.builder().authenticated(true).token(token).refreshToken(refreshToken).build();
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
        String picture = oAuth2User.getAttribute("picture");
        Map<String,Object> map = new HashMap<>();
        map.put("email",email);
        map.put("name",name);
        map.put("picture",picture);
        
        // Tìm user đã tồn tại hoặc tạo mới
        var existingUser = userRepository.findByEmail(email);
        User user;
        
        if(existingUser.isPresent()){
            // User đã tồn tại, cho phép đăng nhập
            if(existingUser.get().getPassword().isEmpty()){
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
            user.setPassword(""); // Google user không cần password
            user.setVerified(true); // Google user đã verified
            user.setLocked(false);
            
            // Set role member cho Google user
            Role userRole = roleRepository.findById("ROLE_USER").orElseThrow(() -> new AppException(ErrorCode.USER_ROLE_NOT_FOUND));
            user.setRoles(Set.of(userRole));
            
            userRepository.save(user);
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


}
