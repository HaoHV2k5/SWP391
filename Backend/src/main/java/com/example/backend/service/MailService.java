package com.example.backend.service;

import com.example.backend.entity.Order;
import com.example.backend.entity.Contract;
import com.example.backend.entity.OrderEscrow;
import com.example.backend.entity.Product;
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

    public void sendRejectProduct(Order order){
        Context context = new Context();
        context.setVariable("buyerName", order.getBuyer().getFullname());
        context.setVariable("productName", order.getProduct().getTitle());
        context.setVariable("sellerName", order.getSeller().getFullname());
        context.setVariable("productLink", "localhost:3939/product/" + order.getProduct().getId());
        String html =  templateEngine.process("email/reject-notice.html",context);
        MimeMessage mimeMessage = javaMailSender.createMimeMessage();
        MimeMessageHelper messageHelper = new MimeMessageHelper(mimeMessage, "UTF-8");
        try {
            messageHelper.setSubject("EVDrive - Đơn hàng của bạn đã bị từ chối");
            messageHelper.setTo((order.getBuyer().getEmail()));
            messageHelper.setText(html,true);
        } catch (MessagingException e) {
            throw new RuntimeException(e);
        }
        javaMailSender.send(mimeMessage);


    }



    public void sendConfirmProduct(OrderEscrow orderEscrow){
        Context context = new Context();
        context.setVariable("buyerName", orderEscrow.getOrder().getBuyer().getFullname());
        context.setVariable("productName", orderEscrow.getOrder().getProduct().getTitle());
        context.setVariable("orderCode", orderEscrow.getOrder().getId());

        context.setVariable("orderAmount", orderEscrow.getOrder().getOfferedPrice());
        context.setVariable("deliveredDate", orderEscrow.getCreatedAt());
        context.setVariable("homeUrl", "http://localhost:5173");


        ;
        String html =  templateEngine.process("email/reminder-confirm-order.html",context);
        MimeMessage mimeMessage = javaMailSender.createMimeMessage();
        MimeMessageHelper messageHelper = new MimeMessageHelper(mimeMessage, "UTF-8");
        try {
            messageHelper.setSubject("EVDrive - Thông báo xác nhận đơn hàng!");
            messageHelper.setTo((orderEscrow.getOrder().getBuyer().getEmail()));
            messageHelper.setText(html,true);
        } catch (MessagingException e) {
            throw new RuntimeException(e);
        }
        javaMailSender.send(mimeMessage);


    }

    /**
     * Gửi email nhắc hợp đồng đã ký quá hạn chưa thanh toán
     */
    public void sendContractUnpaidNotification(String to, String subject, Contract contract, Product product) {
        Context context = new Context();
        context.setVariable("contractId", contract.getId());
        context.setVariable("productName", product.getTitle());
        context.setVariable("signedAt", contract.getSignedAt());
        context.setVariable("expiredAt", contract.getSignedAt() != null ? contract.getSignedAt().plusDays(3) : null);
        context.setVariable("buyerName", contract.getBuyer().getFullname());
        context.setVariable("sellerName", contract.getSeller().getFullname());
        // add nhiều info hơn nếu muốn

        String html = templateEngine.process("email/contract-unpaid.html", context); // bạn cần tạo template này
        MimeMessage mimeMessage = javaMailSender.createMimeMessage();
        try {
            MimeMessageHelper messageHelper = new MimeMessageHelper(mimeMessage, "UTF-8");
            messageHelper.setTo(to);
            messageHelper.setSubject(subject);
            messageHelper.setText(html, true);
            javaMailSender.send(mimeMessage);
        } catch (MessagingException e) {
            // log hoặc throw tùy nhu cầu
        }
    }



    public void sendContractCancelNotification(String to, Contract contract) {
        Context context = new Context();
        context.setVariable("sellerName", contract.getSeller().getFullname());
        context.setVariable("buyerName", contract.getBuyer().getFullname());
        context.setVariable("productName", contract.getProduct().getTitle());
        context.setVariable("contractCode", contract.getContractCode());
        context.setVariable("createdAt", contract.getCreatedAt());

        // add nhiều info hơn nếu muốn

        String html = templateEngine.process("email/Reject-Contract.html", context); // bạn cần tạo template này
        MimeMessage mimeMessage = javaMailSender.createMimeMessage();
        try {
            MimeMessageHelper messageHelper = new MimeMessageHelper(mimeMessage, "UTF-8");
            messageHelper.setTo(to);
            messageHelper.setSubject("[EV Exchange] Hợp đồng bị người mua từ chối - " + contract.getProduct().getTitle());

            messageHelper.setText(html, true);
            javaMailSender.send(mimeMessage);
        } catch (MessagingException e) {
            // log hoặc throw tùy nhu cầu
        }
    }




}
