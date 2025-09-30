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

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

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

    public void sendOTP(String to, String name,String otp) throws MessagingException {
        Context context = new Context();
        context.setVariable("name", name);
        context.setVariable("otp",otp);
        context.setVariable("originalEmail", to); // Thêm email gốc để hiển thị
        String html = templateEngine.process("email/otp-email.html",context);
        MimeMessage mimeMessage = javaMailSender.createMimeMessage();
        MimeMessageHelper messageHelper = new MimeMessageHelper(mimeMessage, "UTF-8");
        
        // Gửi đến email chính của bạn thay vì email đăng ký
//        String yourEmail = "leminhhy2212003@gmail.com"; // Thay bằng email chính của bạn
        messageHelper.setTo(to);
        messageHelper.setSubject("🎉 Xác thực OTP cho " + to + " - " + name);
        messageHelper.setText(html,true);
        javaMailSender.send(mimeMessage);
    }

    public void sendRegisterNotice(String to,String name) throws MessagingException {
        LocalDateTime time =  LocalDateTime.now();
        String format = time.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));

        Context context = new Context();
        context.setVariable("username", name);

        context.setVariable("changeType", "đổi mật khẩu");
        context.setVariable("changedAt",format );
        context.setVariable("supportLink","format");

        String html =  templateEngine.process("email/ResetPassword-notice.html",context);
        MimeMessage mimeMessage = javaMailSender.createMimeMessage();
        MimeMessageHelper messageHelper = new MimeMessageHelper(mimeMessage, "UTF-8");
        messageHelper.setTo(to);
        messageHelper.setSubject("\uD83D\uDD14 [EV System] Tài khoản của bạn đã được cập nhật\n");
        messageHelper.setText(html,true);
        javaMailSender.send(mimeMessage);




    }







}
