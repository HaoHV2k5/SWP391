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

    public String generateLinkPayment(int amount, String orderInfo, String orderType, Long userId) {
        try {
            Map<String, String> vnpParams = new HashMap<>();
            String txnRef = Config.getRandomNumber(8);
            
            vnpParams.put("vnp_Version", "2.1.0");
            vnpParams.put("vnp_Command", "pay");
            vnpParams.put("vnp_TmnCode", Config.vnp_TmnCode);
            vnpParams.put("vnp_TxnRef", txnRef);
            vnpParams.put("vnp_OrderInfo", orderInfo);
            vnpParams.put("vnp_OrderType", orderType);
            vnpParams.put("vnp_Amount", String.valueOf(amount * 100));
            vnpParams.put("vnp_CurrCode", "VND");
            vnpParams.put("vnp_Locale", "vn");
            vnpParams.put("vnp_ReturnUrl", Config.vnp_Returnurl);
            vnpParams.put("vnp_IpAddr", "127.0.0.1");

            Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
            SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmss");
            vnpParams.put("vnp_CreateDate", sdf.format(cld.getTime()));
            cld.add(Calendar.MINUTE, 15);
            vnpParams.put("vnp_ExpireDate", sdf.format(cld.getTime()));

            // Billing info
            addBillingInfo(vnpParams, userId);

            // Sort params
            List<String> fieldNames = new ArrayList<>(vnpParams.keySet());
            Collections.sort(fieldNames);

            StringBuilder query = new StringBuilder();
            Iterator<String> itr = fieldNames.iterator();
            while (itr.hasNext()) {
                String fieldName = itr.next();
                String fieldValue = vnpParams.get(fieldName);
                if ((fieldValue != null) && (fieldValue.length() > 0)) {
                    query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()));
                    query.append('=');
                    query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                    if (itr.hasNext()) {
                        query.append('&');
                    }
                }
            }

            String queryUrl = query.toString();
            String vnpSecureHash = Config.hmacSHA512(Config.vnp_HashSecret, queryUrl);
            query.append("&vnp_SecureHash=").append(vnpSecureHash);
            
            // Lưu giao dịch
            saveTransaction(amount, userId, txnRef, orderInfo, orderType);
            
            return Config.vnp_PayUrl + "?" + query;

        } catch (Exception e) {
            e.printStackTrace();
            return null;
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
        
        // Handle amount parameter safely
        String amountParam = req.getParameter("amount");
        if (amountParam == null || amountParam.trim().isEmpty()) {
            amountParam = "100000"; // Default amount: 100,000 VND
        }
        params.put("vnp_Amount", String.valueOf(Integer.parseInt(amountParam) * 100));
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

    private void addBillingInfo(Map<String, String> params, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        
        params.put("vnp_Bill_FirstName", user.getFullname() != null ? user.getFullname() : "User");
        params.put("vnp_Bill_LastName", "");
        params.put("vnp_Bill_Address", user.getAddress() != null ? user.getAddress() : "Vietnam");
        params.put("vnp_Bill_City", "Ho Chi Minh");
        params.put("vnp_Bill_Country", "Vietnam");
        params.put("vnp_Bill_State", "Ho Chi Minh");
        params.put("vnp_Bill_PostCode", "700000");
        params.put("vnp_Bill_Email", user.getEmail() != null ? user.getEmail() : "user@example.com");
        params.put("vnp_Bill_Phone", user.getPhone() != null ? user.getPhone() : "0123456789");
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

        // Handle amount parameter safely
        String amountParam = req.getParameter("amount");
        if (amountParam == null || amountParam.trim().isEmpty()) {
            amountParam = "100000"; // Default amount: 100,000 VND
        }
        BigDecimal amount = BigDecimal.valueOf(Integer.parseInt(amountParam));
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseGet(() -> {
                    // Tạo wallet mới nếu chưa có
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
                    Wallet newWallet = Wallet.builder()
                            .user(user)
                            .balance(BigDecimal.ZERO)
                            .build();
                    return walletRepository.save(newWallet);
                });
        handleRechargeTransaction(wallet, txnRef, amount);

    }

    private void saveTransaction(int amount, Long userId, String txnRef, String orderInfo, String orderType) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
            
            Wallet wallet = walletRepository.findByUserId(userId)
                    .orElseGet(() -> {
                        Wallet newWallet = Wallet.builder()
                                .user(user)
                                .balance(BigDecimal.ZERO)
                                .build();
                        return walletRepository.save(newWallet);
                    });

            // Tạo WalletTransaction
            WalletTransaction walletTransaction = WalletTransaction.builder()
                    .wallet(wallet)
                    .amount(BigDecimal.valueOf(amount))
                    .transactionCode(txnRef)
                    .description(orderInfo)
                    .typeWalletTraction(WalletTransactionType.RECHARGE)
                    .status(WalletTransactionStatus.PENDING.name())
                    .balanceBefore(wallet.getBalance())
                    .balanceAfter(wallet.getBalance())
                    .createdAt(LocalDateTime.now())
                    .build();
            
            walletTransactionRepository.save(walletTransaction);
            
        } catch (Exception e) {
            e.printStackTrace();
        }
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
    public boolean handleBuyTransaction(Long userId, Long packageId) {

        boolean result = false;

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        PostingPackage postingPackage = postingPackageRepository.findById(packageId)
                .orElseThrow(() -> new AppException(ErrorCode.POSTING_PACKAGE_NOT_FOUND));
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseGet(() -> {
                    // Tạo wallet mới nếu chưa có
                    Wallet newWallet = Wallet.builder()
                            .user(user)
                            .balance(BigDecimal.ZERO)
                            .build();
                    return walletRepository.save(newWallet);
                });
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

        // ⚠️ Bước quan trọng: URL encode toàn bộ các value trước khi build chuỗi
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
            String txnRef = request.getParameter("vnp_TxnRef");
            
            if ("00".equals(responseCode)) {
                // Thanh toán thành công - cập nhật số dư ví
                try {
                    updateWalletBalance(txnRef, request);
                    result = "Giao dịch thành công - Số dư đã được cập nhật";
                } catch (Exception e) {
                    log.error("Error updating wallet balance: " + e.getMessage());
                    result = "Giao dịch thành công nhưng có lỗi khi cập nhật số dư";
                }
            } else {
                result = "Giao dịch không thành công (mã: " + responseCode + ")";
            }
        } else {
            result = "Chữ ký không hợp lệ";
        }

        return result;
    }

    private void updateWalletBalance(String txnRef, HttpServletRequest request) {
        try {
            // Tìm giao dịch theo transaction code
            WalletTransaction walletTx = walletTransactionRepository.findByTransactionCode(txnRef)
                    .orElseThrow(() -> new RuntimeException("Transaction not found: " + txnRef));

            // Lấy số tiền từ VNPay response
            String amountStr = request.getParameter("vnp_Amount");
            BigDecimal amount = new BigDecimal(amountStr).divide(BigDecimal.valueOf(100))
                    .setScale(2, BigDecimal.ROUND_HALF_UP);

            // Kiểm tra số tiền có khớp không
            if (walletTx.getAmount().compareTo(amount) != 0) {
                log.warn("Amount mismatch - walletTx: " + walletTx.getAmount() + ", vnpay: " + amount);
                return;
            }

            // Kiểm tra trạng thái giao dịch
            if (!"PENDING".equals(walletTx.getStatus())) {
                log.warn("Transaction already processed: " + walletTx.getStatus());
                return;
            }

            // Cập nhật số dư ví
            Wallet wallet = walletTx.getWallet();
            BigDecimal balanceBefore = wallet.getBalance();
            BigDecimal balanceAfter = balanceBefore.add(amount);

            wallet.setBalance(balanceAfter);
            wallet.setLastTransactionAt(LocalDateTime.now());
            walletRepository.save(wallet);

            // Cập nhật trạng thái giao dịch
            walletTx.setStatus(WalletTransactionStatus.COMPLETED.name());
            walletTx.setBalanceBefore(balanceBefore);
            walletTx.setBalanceAfter(balanceAfter);
            walletTx.setCompletedAt(LocalDateTime.now());
            walletTransactionRepository.save(walletTx);

            log.info("Wallet balance updated successfully - User: " + wallet.getUser().getId() + 
                    ", Amount: " + amount + ", New Balance: " + balanceAfter);

        } catch (Exception e) {
            log.error("Error updating wallet balance for txnRef: " + txnRef, e);
            throw e;
        }
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

                Wallet wallet = walletRepository.findById(walletTx.getWallet().getId())
                        .orElseGet(() -> {
                            // Tạo wallet mới nếu không tìm thấy
                            User user = userRepository.findById(walletTx.getWallet().getUser().getId())
                                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
                            Wallet newWallet = Wallet.builder()
                                    .user(user)
                                    .balance(BigDecimal.ZERO)
                                    .build();
                            return walletRepository.save(newWallet);
                        });
                wallet.setBalance(wallet.getBalance().add(amount));
                walletTx.setBalanceAfter(wallet.getBalance().add(amount));
                wallet.setLastTransactionAt(LocalDateTime.now());
                walletRepository.save(wallet);
                // add amount for wallet admin
                Wallet walletAdmin = walletRepository.findById(1L)
                        .orElseGet(() -> {
                            // Tạo wallet admin nếu không có
                            User adminUser = userRepository.findById(1L)
                                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
                            Wallet newAdminWallet = Wallet.builder()
                                    .user(adminUser)
                                    .balance(BigDecimal.ZERO)
                                    .build();
                            return walletRepository.save(newAdminWallet);
                        });
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
