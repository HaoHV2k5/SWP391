package com.example.backend.service;

import com.example.backend.dto.request.IntrospectRequest;
import com.example.backend.dto.request.LoginRequest;
import com.example.backend.dto.request.RefreshRequest;
import com.example.backend.dto.response.IntrospectResponse;
import com.example.backend.dto.response.LoginResponse;
import com.example.backend.dto.response.RefreshResponse;
import com.example.backend.entity.User;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.repository.UserRepository;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
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
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final UserService userService;
    @Value("${jwt.secret}")
    private  String jwtSecret;


    public LoginResponse login(LoginRequest loginRequest) {
        User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow( () -> new AppException(ErrorCode.USER_NOT_EXISTED));
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
        // dang phan van co can tao user nay trong database khong
        var user = userRepository.findByEmail(email);
        if(user.isPresent()){
            throw  new AppException(ErrorCode.USER_EXISTED);
        }
        User newUser = new User();
        newUser.setUsername(email);


        String token = jwtService.generateToken(newUser);
        map.put("token",token);
        String freshToken = jwtService.generateToken(newUser);
        map.put("refreshToken",freshToken);
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
