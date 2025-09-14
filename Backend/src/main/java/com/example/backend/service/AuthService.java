package com.example.backend.service;

import com.example.backend.dto.request.IntrospectRequest;
import com.example.backend.dto.request.LoginRequest;
import com.example.backend.dto.response.IntrospectResponse;
import com.example.backend.dto.response.LoginResponse;
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
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    private final UserRepository userRepository;
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
        String token = generateToken(user);


        return LoginResponse.builder().authenticated(true).token(token).build();
    }

    public String generateToken(User user){

        JWSHeader jwsHeader = new JWSHeader(JWSAlgorithm.HS512);


        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .issuer("swp391.com")
                .subject(user.getUsername())
                .issueTime(new Date())
                .expirationTime(Date.from(Instant.now().plus(30, ChronoUnit.MINUTES)))
                .jwtID(UUID.randomUUID().toString())
                .build();

        Payload payload = new Payload(jwtClaimsSet.toJSONObject());


        JWSObject jwsObject = new JWSObject(jwsHeader,payload);

        try {
            jwsObject.sign(new MACSigner(jwtSecret.getBytes()));
        } catch (JOSEException e) {
            log.info("can not generate token");
        }
        return  jwsObject.serialize();

    }

    public IntrospectResponse introspectToken(IntrospectRequest request){
        String token = request.getToken();
        boolean isValid = true;

        try {
            verifyJwt(token);
        } catch (Exception e) {
            isValid = false;
        }
    return IntrospectResponse.builder().authenticated(isValid).build();

    }

    public void verifyJwt(String token) throws JOSEException, ParseException {
        JWSVerifier jwsVerifier = new MACVerifier(jwtSecret.getBytes());
        SignedJWT signedJWT = SignedJWT.parse(token);
        boolean verify = signedJWT.verify(jwsVerifier);
        Date expiration = signedJWT.getJWTClaimsSet().getExpirationTime();
        if(!(verify && expiration.after(new Date()))){
             throw  new AppException(ErrorCode.UNAUTHENTICATED);
        }
//        return signedJWT;
    }



}
