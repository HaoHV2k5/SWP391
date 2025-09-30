package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Set;

@Entity
@Data

@Table(name = "users",

uniqueConstraints = {
        @UniqueConstraint(columnNames = "username"),
        @UniqueConstraint(columnNames = "email")
})
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id

    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    private String username;
    @Column(nullable = false)
    private String password;

    @Column(columnDefinition = "NVARCHAR(100)")
    private String fullname;
    private String avatar;
    private String gender;
    private LocalDate yob;
    @Column(nullable = false)
    private String email;
    private String phone;
    @Column(columnDefinition = "NVARCHAR(255)")
    private String address;
    @ManyToMany
    private Set<Role> roles;
    @Builder.Default
    private boolean isVerified = false;
    @Column(name = "locked",nullable = false)
    @Builder.Default
    private boolean locked = false;



}
