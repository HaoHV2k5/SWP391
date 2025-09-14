package com.example.backend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.codec.Utf8;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Service
@RequiredArgsConstructor
public class MailService {
    private final JavaMailSender javaMailSender;
    private final TemplateEngine templateEngine;
    public void sendEmail(String to,String loginURL, String name) throws MessagingException {
        Context context = new Context();
        context.setVariable("name", name);
        context.setVariable("loginUrl",loginURL);
        String html = templateEngine.process("email/welcome-email.html",context);
        MimeMessage mimeMessage = javaMailSender.createMimeMessage();
        MimeMessageHelper messageHelper = new MimeMessageHelper(mimeMessage, "UTF-8");
        messageHelper.setTo(to);
        messageHelper.setSubject("🎉 Chào mừng bạn đến với EV Exchange!");
        messageHelper.setText(html,true);
        javaMailSender.send(mimeMessage);

    }



}
