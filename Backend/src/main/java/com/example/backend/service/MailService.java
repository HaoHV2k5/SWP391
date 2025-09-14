package com.example.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MailService {
    private final JavaMailSender javaMailSender;

    public void sendEmail(String to){
        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setFrom("magicmath2k5@gmail.com");
        mailMessage.setTo(to);
        mailMessage.setSubject("Welcome to the Register Account");
        mailMessage.setText("Register Account Successfully");
        javaMailSender.send(mailMessage);
    }



}
