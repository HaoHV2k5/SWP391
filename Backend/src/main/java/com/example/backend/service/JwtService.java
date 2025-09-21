package com.example.backend.service;

import com.example.backend.entity.Role;
import com.example.backend.entity.User;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Collection;
import java.util.Collections;
import java.util.Date;
import java.util.Set;
import java.util.StringJoiner;
import java.util.UUID;

@Service
@Slf4j
public class JwtService {
    @Value("${jwt.secret}")
    private  String jwtSecret;

    @Value("${jwt.expiration}")
    private  long jwtexpiration;

    @Value("${refreshjwt.expriation}")
    private  long refreshjwtexpiration;
    public String generateToken(User user){

        JWSHeader jwsHeader = new JWSHeader(JWSAlgorithm.HS512);


        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .issuer("swp391.com")
                .subject(user.getUsername())
                .issueTime(new Date())
                .expirationTime(Date.from(Instant.now().plus(jwtexpiration, ChronoUnit.MINUTES)))
                .jwtID(UUID.randomUUID().toString())
                .claim("scope", buidScope(user.getRoles()))
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

    public String buidScope(Set<Role> roles){
        StringJoiner stringJoiner = new StringJoiner(" ");
        if(!CollectionUtils.isEmpty(roles)){
            roles.forEach(role -> {
                stringJoiner.add("ROLE_"+role.getName());
                if(!CollectionUtils.isEmpty(role.getPermissions())){
                    role.getPermissions().forEach(permission -> {
                        stringJoiner.add(permission.getName());
                    });
                }
            });
        }
        
        
        
        return stringJoiner.toString();
    }


    public String generateRefreshToken(User user){

        JWSHeader jwsHeader = new JWSHeader(JWSAlgorithm.HS512);


        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .issuer("swp391.com")
                .subject(user.getUsername())
                .issueTime(new Date())
                .expirationTime(Date.from(Instant.now().plus(refreshjwtexpiration, ChronoUnit.DAYS)))
                .jwtID(UUID.randomUUID().toString())
                .build();

        Payload payload = new Payload(jwtClaimsSet.toJSONObject());


        JWSObject jwsObject = new JWSObject(jwsHeader,payload);

        try {
            jwsObject.sign(new MACSigner(jwtSecret.getBytes()));
        } catch (JOSEException e) {
            log.info("can not generate refresh token");
        }
        return  jwsObject.serialize();
    }


    public SignedJWT verifyJwt(String token) throws JOSEException, ParseException {
        JWSVerifier jwsVerifier = new MACVerifier(jwtSecret.getBytes());
        SignedJWT signedJWT = SignedJWT.parse(token);
        boolean verify = signedJWT.verify(jwsVerifier);
        Date expiration = signedJWT.getJWTClaimsSet().getExpirationTime();
        if(!(verify && expiration.after(new Date()))){

            throw  new AppException(ErrorCode.UNAUTHENTICATED);

        }
        return signedJWT;

    }

//    public String getUsername(String token) throws ParseException, JOSEException {
//        SignedJWT signedJWT = verifyJwt(token);
//        String userName  = signedJWT.getJWTClaimsSet().getSubject();
//        return userName;
//    }



}
