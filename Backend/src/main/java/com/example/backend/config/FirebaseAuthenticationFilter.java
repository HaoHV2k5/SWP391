package com.example.backend.config;

// Tạm thời comment FirebaseAuthenticationFilter để backend có thể start
/*
import com.example.backend.service.FirebaseAuthService;
import com.example.backend.entity.User;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
@Component
@Slf4j
public class FirebaseAuthenticationFilter extends OncePerRequestFilter {
    
    private FirebaseAuthService firebaseAuthService;
    
    @Autowired
    public void setFirebaseAuthService(FirebaseAuthService firebaseAuthService) {
        this.firebaseAuthService = firebaseAuthService;
    }
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
                                  FilterChain filterChain) throws ServletException, IOException {
        
        String authHeader = request.getHeader("Authorization");
        
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            
            try {
                // Kiểm tra xem có phải Firebase token không
                if (isFirebaseToken(token)) {
                    log.info("Detected Firebase token, validating...");
                    
                    // Validate Firebase token
                    User user = firebaseAuthService.validateFirebaseToken(token);
                    
                    // Tạo authentication
                    UsernamePasswordAuthenticationToken authentication = 
                        new UsernamePasswordAuthenticationToken(
                            user.getEmail(), 
                            null, 
                            Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
                        );
                    
                    // Set user details
                    authentication.setDetails(user);
                    
                    // Set authentication in security context
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    
                    log.info("Firebase user authenticated: {}", user.getEmail());
                }
                
            } catch (Exception e) {
                log.error("Firebase token validation failed: {}", e.getMessage());
                // Không throw exception, để filter chain tiếp tục
            }
        }
        
        filterChain.doFilter(request, response);
    }
    
    // Kiểm tra xem token có phải Firebase token không
    private boolean isFirebaseToken(String token) {
        try {
            // Firebase token có format: header.payload.signature
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                return false;
            }
            
            // Decode header để kiểm tra
            String header = new String(java.util.Base64.getUrlDecoder().decode(parts[0]));
            return header.contains("firebase") || header.contains("kid");
            
        } catch (Exception e) {
        return false;
    }
}
*/
