package com.example.backend.controller;

import com.example.backend.dto.response.ApiResponse;
import com.example.backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/oauth2")
@RequiredArgsConstructor
public class RedirectController {
    
    private final AuthService authService;
    
    @GetMapping("/success")
    public String googleSuccess(OAuth2AuthenticationToken token) {
        try {
            System.out.println("=== Google OAuth2 Success ===");
            System.out.println("Token: " + token);
            System.out.println("Token type: " + (token != null ? token.getClass().getSimpleName() : "null"));
            
            if (token == null) {
                System.out.println("OAuth2AuthenticationToken is null - redirecting to login");
                return "<!DOCTYPE html>" +
                        "<html>" +
                        "<head>" +
                        "<title>Login Required</title>" +
                        "</head>" +
                        "<body>" +
                        "<script>" +
                        "alert('Vui lòng đăng nhập trước khi sử dụng Google OAuth2');" +
                        "window.location.href = 'http://localhost:5173/login';" +
                        "</script>" +
                        "<p>Đang chuyển về trang đăng nhập...</p>" +
                        "</body>" +
                        "</html>";
            }
            
            System.out.println("Principal: " + token.getPrincipal());
            System.out.println("Authorities: " + token.getAuthorities());
            // check user
            Map<String, Object> result = authService.googleLogin(token);
            System.out.println("AuthService result: " + result);
            
            System.out.println("=== Creating HTML response ===");
            // Tạo HTML để redirect về FE với data
            String tokenData = result.get("token").toString();
            String refreshTokenData = result.get("refreshToken").toString();
            String email = result.get("email").toString();
            String name = result.get("name").toString();


            // Redirect trực tiếp về frontend với token trong URL
            String redirectUrl = "http://localhost:5173/?token=" + tokenData + "&email=" + email + "&name=" + name;
            
            System.out.println("=== Redirecting to frontend: " + redirectUrl + " ===");
            
            // Tạo HTML redirect đơn giản
            String htmlResponse = "<!DOCTYPE html>" +
                    "<html>" +
                    "<head>" +
                    "<title>Redirecting...</title>" +
                    "</head>" +
                    "<body>" +
                    "<script>" +
                    "console.log('Redirecting to frontend with token...');" +
                    "window.location.href = '" + redirectUrl + "';" +
                    "</script>" +
                    "<p>Redirecting to application...</p>" +
                    "</body>" +
                    "</html>";
            
            return htmlResponse;
        } catch (Exception e) {
            // Log lỗi để debug
            System.err.println("Google login error: " + e.getMessage());
            e.printStackTrace();
            
            // Nếu có lỗi, vẫn cố gắng redirect về frontend với thông báo lỗi
            return "<!DOCTYPE html>" +
                    "<html>" +
                    "<head>" +
                    "<title>Login Error</title>" +
                    "</head>" +
                    "<body>" +
                    "<script>" +
                    "localStorage.setItem('googleLoginError', 'true');" +
                    "localStorage.setItem('googleLoginErrorMessage', 'Đăng nhập Google thất bại: " + e.getMessage().replace("'", "\\'") + "');" +
                    "window.location.href = 'http://localhost:5173/';" +
                    "</script>" +
                    "<p>Đang chuyển về trang chủ...</p>" +
                    "</body>" +
                    "</html>";
        }
    }
}


