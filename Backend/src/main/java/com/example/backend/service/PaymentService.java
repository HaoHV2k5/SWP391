package com.example.backend.service;

import com.example.backend.config.Config;
import com.example.backend.dto.response.TransactionHistoryResponse;
import com.example.backend.entity.*;
import com.example.backend.enums.PaymentMethod;
import com.example.backend.enums.TransactionStatus;
import com.example.backend.enums.WalletTransactionStatus;
import com.example.backend.enums.WalletTransactionType;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.TransactionMapper;
import com.example.backend.repository.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.UnsupportedEncodingException;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class PaymentService {
    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final UserRepository userRepository;
    private final PostingPackageRepository postingPackageRepository;
    private final TransactionRepository transactionRepository;
    private final UserPostingPackageRepository userPostingPackageRepository;
    private final TransactionMapper transactionMapper;
    private final UserPackageTransactionRepository userPackageTransactionRepository;

    public Map<String, Object> generateLinkPayment(HttpServletRequest req, Long userId) {
        try {
            Map<String, String> vnpParams = buildVnpParams(req);
            String paymentUrl = buildPaymentUrl(vnpParams);

            // Lưu giao dịch (wallet hoặc transaction)
            saveTransaction(req, userId, vnpParams.get("vnp_TxnRef"));

            return Map.of(
                    "code", "00",
                    "message", "success",
                    "data", paymentUrl
            );

        } catch (Exception e) {
            e.printStackTrace();
            return Map.of(
                    "code", "99",
                    "message", "error: " + e.getMessage()
            );
        }
    }
    private Map<String, String> buildVnpParams(HttpServletRequest req) throws UnsupportedEncodingException {
        Map<String, String> params = new HashMap<>();
        String txnRef = Config.getRandomNumber(8);

        params.put("vnp_Version", "2.1.0");
        params.put("vnp_Command", "pay");
        params.put("vnp_TmnCode", Config.vnp_TmnCode);
        params.put("vnp_TxnRef", txnRef);
        params.put("vnp_OrderInfo", req.getParameter("vnp_OrderInfo"));
        params.put("vnp_OrderType", req.getParameter("ordertype"));
        params.put("vnp_Amount", String.valueOf(Integer.parseInt(req.getParameter("amount")) * 100));
        params.put("vnp_CurrCode", "VND");
        params.put("vnp_Locale", Optional.ofNullable(req.getParameter("language")).orElse("vn"));
        params.put("vnp_ReturnUrl", Config.vnp_Returnurl);
        params.put("vnp_IpAddr", Config.getIpAddress(req));

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmss");
        params.put("vnp_CreateDate", sdf.format(cld.getTime()));
        cld.add(Calendar.MINUTE, 15);
        params.put("vnp_ExpireDate", sdf.format(cld.getTime()));

        // Billing info
        addBillingInfo(req, params);

        return params;
    }
    private void addBillingInfo(HttpServletRequest req, Map<String, String> params) {
        params.put("vnp_Bill_Mobile", req.getParameter("txt_billing_mobile"));
        params.put("vnp_Bill_Email", req.getParameter("txt_billing_email"));

        String fullName = req.getParameter("txt_billing_fullname");
        if (fullName != null && !fullName.trim().isEmpty()) {
            String[] parts = fullName.trim().split("\\s+");
            params.put("vnp_Bill_FirstName", parts[0]);
            params.put("vnp_Bill_LastName", parts[parts.length - 1]);
        }
    }
    private String buildPaymentUrl(Map<String, String> params) throws UnsupportedEncodingException {
        List<String> fieldNames = new ArrayList<>(params.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();

        for (Iterator<String> it = fieldNames.iterator(); it.hasNext();) {
            String key = it.next();
            String value = params.get(key);
            if (value != null && !value.isEmpty()) {
                hashData.append(key).append('=').append(URLEncoder.encode(value, StandardCharsets.UTF_8));
                query.append(URLEncoder.encode(key, StandardCharsets.UTF_8))
                        .append('=').append(URLEncoder.encode(value, StandardCharsets.UTF_8));
                if (it.hasNext()) {
                    hashData.append('&');
                    query.append('&');
                }
            }
        }

        String vnpSecureHash = Config.hmacSHA512(Config.vnp_HashSecret, hashData.toString());
        query.append("&vnp_SecureHash=").append(vnpSecureHash);
        return Config.vnp_PayUrl + "?" + query;
    }
    private void saveTransaction(HttpServletRequest req, Long userId, String txnRef) {

        BigDecimal amount = BigDecimal.valueOf(Integer.parseInt(req.getParameter("amount")));
        
        // Tự động tạo wallet nếu chưa tồn tại
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseGet(() -> {
                    // Tìm user để đảm bảo user tồn tại
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
                    
                    // Tạo wallet mới với số dư 0
                    Wallet newWallet = Wallet.builder()
                            .user(user)
                            .balance(BigDecimal.ZERO)
                            .isActive(true)
                            .build();
                    
                    log.info("Auto-creating wallet for user ID: {}", userId);
                    return walletRepository.save(newWallet);
                });
        
        handleRechargeTransaction(wallet, txnRef, amount);

    }
    private void handleRechargeTransaction(Wallet wallet, String txnRef, BigDecimal amount) {
        WalletTransaction walletTx = WalletTransaction.builder()
                .wallet(wallet)
                .transactionCode(txnRef)
                .typeWalletTraction(WalletTransactionType.RECHARGE)
                .amount(amount)
                .balanceBefore(wallet.getBalance())
                .balanceAfter(wallet.getBalance())
                .status(WalletTransactionStatus.PENDING.name())
                .description("Nạp tiền vào ví qua VNPAY")
                .build();

        walletTransactionRepository.save(walletTx);
    }
    // mua goi
    public boolean handleBuyTransaction(Long userId, Long packageId) {
        // Kiểm tra xem user có gói còn hiệu lực không
        UserPostingPackage currentActive = userPackageTransactionRepository.findPostingPackageByUserIdAndActiveTrue(userId);
        if (currentActive != null && currentActive.getEndTime().isAfter(LocalDateTime.now())) {
            PostingPackage currentPackage = currentActive.getPostingPackage();
            PostingPackage newPackage = postingPackageRepository.findById(packageId)
                    .orElseThrow(() -> new AppException(ErrorCode.POSTING_PACKAGE_NOT_FOUND));
            // Nếu gói mới rẻ hơn hoặc bằng gói đang dùng thì không cho mua
            if (newPackage.getPrice().compareTo(currentPackage.getPrice()) <= 0) {
                // Có thể throw AppException (ErrorCode.PACKAGE_CANNOT_BUY_LOWER) hoặc return false tuỳ ý
                throw new AppException(ErrorCode.PACKAGE_CANNOT_BUY_LOWER);
            }
        }

        boolean result = false;

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        PostingPackage postingPackage = postingPackageRepository.findById(packageId)
                .orElseThrow(() -> new AppException(ErrorCode.POSTING_PACKAGE_NOT_FOUND));
        Wallet wallet = walletRepository.findByUserId(userId).orElseThrow(() -> new AppException(ErrorCode.WALLET_NOT_EXIST));
        String transactionCode = Config.getRandomNumber(8);

        Transaction transaction = Transaction.builder()
                .wallet(wallet)
                .transactionCode(transactionCode)
                .amount(postingPackage.getPrice())
                .user(user)
                .paymentMethod(PaymentMethod.WALLET)
                .description("Mua gói đăng tin")
                .status(TransactionStatus.PENDING)
                .postingPackage(postingPackage)
                .paymentDate(LocalDateTime.now())
                .build();
        boolean check = false;
        transactionRepository.save(transaction);
        BigDecimal balanceWallet = wallet.getBalance();
        BigDecimal balanceBefore = wallet.getBalance();
        BigDecimal balanceAfter =  wallet.getBalance();
        // kiem tra xem vi co du tien mua ko
        if(transaction.getAmount().compareTo(balanceWallet) <= 0) {

            balanceAfter = wallet.getBalance().subtract(postingPackage.getPrice());
            wallet.setBalance(balanceAfter);
            transaction.setStatus(TransactionStatus.COMPLETED);
            transactionRepository.save(transaction);
            walletRepository.save(wallet);
            handleBuyPostingPackage(wallet,transaction,balanceBefore,balanceAfter,postingPackage);
            // Tạo UserPostingPackage mới cho user
            LocalDateTime start = LocalDateTime.now();
            LocalDateTime end = start.plusDays(postingPackage.getDuration());
            UserPostingPackage upp = UserPostingPackage.builder()
                    .user(user)
                    .postingPackage(postingPackage)
                    .startTime(start)
                    .endTime(end)
                    .postPossible(postingPackage.getPostLimit())
                    .active(true)
                    .build();
            userPostingPackageRepository.save(upp);
            result = true;

        }
       else {
           transaction.setStatus(TransactionStatus.FAILED);
           transaction.setDescription("Trong ví không đủ tiền!");
           transactionRepository.save(transaction);

           walletRepository.save(wallet);
            handleBuyPostingPackage(wallet,transaction,balanceBefore,balanceAfter,postingPackage);

        }

        return result;

    }

    private void handleBuyPostingPackage(Wallet wallet,

                                        Transaction transaction,
                                        BigDecimal before,
                                        BigDecimal after,
                                        PostingPackage postingPackage) {

       String status = "";
       String description = "";
        Long userId = wallet.getUser().getId();
        if(before.compareTo(after) > 0) {
            status = WalletTransactionStatus.COMPLETED.name();
            description= "Mua gói thành công";
            List<UserPostingPackage> list = userPackageTransactionRepository.findByUserId(userId);
            list.forEach(x -> x.setActive(false));
        }
        else{
            description = "Mua gói thất bại";
        }
        WalletTransaction walletTransaction = WalletTransaction.builder()
                .wallet(wallet)
                .postingPackage(postingPackage)
                .transactionCode(Config.getRandomNumber(8))
                .amount(transaction.getAmount())
                .referenceTransaction(transaction)
                .balanceBefore(before)
                .balanceAfter(after)
                .status(status)
                .completedAt(LocalDateTime.now())
                .description(description)
                .createdAt(LocalDateTime.now())
                .typeWalletTraction(WalletTransactionType.PAYMENT_PACKAGE)
                .build();

        walletTransactionRepository.save(walletTransaction);
    }



    public String vnpReturn(HttpServletRequest request) {
        String result;

        Map<String, String> fields = new HashMap<>();
        // Lấy tất cả parameter từ VNPAY trả về
        request.getParameterMap().forEach((key, values) -> {
            if (values.length > 0 && values[0] != null && !values[0].isEmpty()) {
                fields.put(key, values[0]);
            }
        });

        String vnp_SecureHash = request.getParameter("vnp_SecureHash");

        // Xóa 2 field này trước khi hash
        fields.remove("vnp_SecureHashType");
        fields.remove("vnp_SecureHash");

        //  Bước quan trọng: URL encode toàn bộ các value trước khi build chuỗi
        List<String> fieldNames = new ArrayList<>(fields.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        for (int i = 0; i < fieldNames.size(); i++) {
            String fieldName = fieldNames.get(i);
            String fieldValue = fields.get(fieldName);
            if (fieldValue != null && !fieldValue.isEmpty()) {
                hashData.append(fieldName)
                        .append("=")
                        .append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                if (i < fieldNames.size() - 1) {
                    hashData.append("&");
                }
            }
        }

        // Hash bằng HMAC SHA512 với vnp_HashSecret
        String signValue = Config.hmacSHA512(Config.vnp_HashSecret, hashData.toString());

        if (signValue.equalsIgnoreCase(vnp_SecureHash)) {
            // Nếu chữ ký hợp lệ, kiểm tra mã phản hồi
            String responseCode = request.getParameter("vnp_ResponseCode");
            if ("00".equals(responseCode)) {
                result = "success";
            } else {
                result = "false";
            }
        } else {
            result = "Chữ ký không hợp lệ";
        }

        return result;
    }



    public Map<String, String> handleVnpayIpn(Map<String, String> params) {
        Map<String, String> response = new HashMap<>();
        try {
            Map<String, String> fields = new HashMap<>(params);
            String vnp_SecureHash = fields.remove("vnp_SecureHash");
            fields.remove("vnp_SecureHashType");

            String signValue = Config.hashAllFields(fields);

            if (!signValue.equals(vnp_SecureHash)) {
                log.warn("khoa hash khong dung");
                return Map.of("RspCode", "97", "Message", "Invalid Checksum");
            }
            log.warn("key đã đúng");

            String txnRef = params.get("vnp_TxnRef");
            log.warn("txnRef"+txnRef);
            String responseCode = params.get("vnp_ResponseCode");
            log.warn("responseCode"+responseCode);

            BigDecimal amount = new BigDecimal(params.get("vnp_Amount")).divide(BigDecimal.valueOf(100))
                            .setScale(2, BigDecimal.ROUND_HALF_UP);
            WalletTransaction walletTx = walletTransactionRepository.findByTransactionCode(txnRef)
                    .orElseThrow(() -> new RuntimeException("Order not found"));

                if (walletTx.getAmount().compareTo(amount) != 0) {
                    log.warn("amount khác");
                    log.warn("walletTx: "+walletTx.getAmount());
                    log.warn("amount: "+amount);

                    return Map.of("RspCode", "04", "Message", "Invalid Amount");
                }

            if (!walletTx.getStatus().equals("PENDING")) {
                log.warn("wallet khong ơ trạng thái pending");

                return Map.of("RspCode", "02", "Message", "Order already confirmed");
            }

            if ("00".equals(responseCode)) {
                walletTx.setStatus(WalletTransactionStatus.COMPLETED.name());
                walletTx.setCompletedAt(LocalDateTime.now());

                Wallet wallet = walletRepository.findById(walletTx.getWallet().getId()).orElseThrow(() -> new AppException(ErrorCode.WALLET_NOT_EXIST));
                wallet.setBalance(wallet.getBalance().add(amount));
                walletTx.setBalanceAfter(wallet.getBalance());
                wallet.setLastTransactionAt(LocalDateTime.now());
                walletRepository.save(wallet);
                // add amount for wallet admin
                Wallet walletAdmin = walletRepository.findById(1L).orElseThrow(() -> new AppException(ErrorCode.WALLET_NOT_EXIST));
                walletAdmin.setBalance(walletAdmin.getBalance().add(amount));
            } else {
                log.warn("giao dich thât bại");

                walletTx.setStatus("FAILED");
            }

            walletTransactionRepository.save(walletTx);
            response.put("RspCode", "00");
            response.put("Message", "Confirm Success");

        } catch (Exception e) {
            e.printStackTrace();
            response.put("RspCode", "99");
            response.put("Message", "Unknown error");
        }
        return response;










    }







}
