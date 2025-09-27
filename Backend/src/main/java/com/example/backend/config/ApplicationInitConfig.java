package com.example.backend.config;

import com.example.backend.entity.Permission;
import com.example.backend.entity.Role;
import com.example.backend.entity.User;
import com.example.backend.enums.Roles;
import com.example.backend.repository.PermissionRepository;
import com.example.backend.repository.RoleRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashSet;
import java.util.Set;
@Slf4j
@Configuration
@RequiredArgsConstructor
public class ApplicationInitConfig {
    private final PasswordEncoder passwordEncoder;
    @Bean
    public ApplicationRunner  init(UserRepository userRepository, RoleRepository roleRepository, PermissionRepository permissionRepository) {
        log.info("Initializing application.....");

        return args -> {
           if (userRepository.findByUsername("admin@gmail.com").isEmpty()) {
               // Tạo permissions
               Permission sellProductPermission = Permission.builder()
                       .name("SELL_PRODUCT")
                       .description("Permission to sell products")
                       .build();
               permissionRepository.save(sellProductPermission);
               
               // Tạo roles
               Role adminRole = Role.builder().name(Roles.ADMIN.name()).description("ADMIN role").build();
               Role userRole = Role.builder().name(Roles.USER.name()).description("USER role").build();
               
               // Gán permission SELL_PRODUCT cho role USER
               Set<Permission> userPermissions = new HashSet<>();
               userPermissions.add(sellProductPermission);
               userRole.setPermissions(userPermissions);
               
               roleRepository.save(adminRole);
               roleRepository.save(userRole);
               
               // Tạo admin user
               Set<Role> roles = new HashSet<>();
               roles.add(adminRole);
               User user = User.builder()
                       .username("admin@gmail.com")
                       .password(passwordEncoder.encode("admin"))
                       .isVerified(true)
                       .locked(false)
                       .email("admin@gmail.com")
                       .roles(roles)
                       .build();
               userRepository.save(user);
               log.info("Application initialization completed .....");
           };
       };
    }

}
