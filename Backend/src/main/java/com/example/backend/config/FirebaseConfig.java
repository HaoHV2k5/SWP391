//package com.example.backend.config;
//
//import com.google.firebase.FirebaseApp;
//import com.google.firebase.FirebaseOptions;
//import com.google.firebase.auth.FirebaseAuth;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//
//import javax.annotation.PostConstruct;
//import java.io.FileInputStream;
//import java.io.IOException;
//
//@Configuration
//@Slf4j
//public class FirebaseConfig {
//
//    @Value("${firebase.project-id:swp391-3fa40}")
//    private String projectId;
//
//    @Value("${firebase.private-key:}")
//    private String privateKey;
//
//    @Value("${firebase.client-email:}")
//    private String clientEmail;
//
//    // Tạm thời comment Firebase initialization để backend có thể start
//    /*
//    @PostConstruct
//    public void initializeFirebase() {
//        try {
//            if (FirebaseApp.getApps().isEmpty()) {
//                FirebaseOptions options = FirebaseOptions.builder()
//                        .setProjectId(projectId)
//                        .setCredentials(com.google.auth.oauth2.GoogleCredentials.getApplicationDefault())
//                        .build();
//
//                FirebaseApp.initializeApp(options);
//                log.info("Firebase initialized successfully");
//            }
//        } catch (Exception e) {
//            log.error("Error initializing Firebase: {}", e.getMessage());
//            // Fallback: Initialize with default credentials
//            try {
//                FirebaseOptions options = FirebaseOptions.builder()
//                        .setProjectId(projectId)
//                        .build();
//
//                FirebaseApp.initializeApp(options);
//                log.info("Firebase initialized with default credentials");
//            } catch (Exception ex) {
//                log.error("Failed to initialize Firebase: {}", ex.getMessage());
//            }
//        }
//    }
//
//    @Bean
//    public FirebaseAuth firebaseAuth() {
//        return FirebaseAuth.getInstance();
//    }
//    */
//}
