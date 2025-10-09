package com.example.backend.service;

import com.example.backend.config.Config;
import com.example.backend.entity.Wallet;
import com.example.backend.entity.WalletTransaction;
import com.example.backend.enums.WalletTransactionStatus;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.repository.WalletRepository;
import com.example.backend.repository.WalletTransactionRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
@RequiredArgsConstructor
public class PaymentService {
    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    public Map<String,Object> generateLinkPayment(HttpServletRequest req, Long userID){
        Map<String, Object> result = new HashMap<>();
        Map<String, Object> error = new HashMap<>();
        try {
            String vnp_Version = "2.1.0";
            String vnp_Command = "pay";
            String vnp_OrderInfo = req.getParameter("vnp_OrderInfo");
            String orderType = req.getParameter("ordertype");
            String vnp_TxnRef = Config.getRandomNumber(8);
            String vnp_IpAddr = Config.getIpAddress(req);
            String vnp_TmnCode = Config.vnp_TmnCode;

            int amount = Integer.parseInt(req.getParameter("amount")) * 100;

            Map<String, String> vnp_Params = new HashMap<>();
            vnp_Params.put("vnp_Version", vnp_Version);
            vnp_Params.put("vnp_Command", vnp_Command);
            vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
            vnp_Params.put("vnp_Amount", String.valueOf(amount));
            vnp_Params.put("vnp_CurrCode", "VND");

//            String bank_code = req.getParameter("bankcode");
//            if (bank_code != null && !bank_code.isEmpty()) {
//                vnp_Params.put("vnp_BankCode", bank_code);
//            }

            vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
            vnp_Params.put("vnp_OrderInfo", vnp_OrderInfo);
            vnp_Params.put("vnp_OrderType", orderType);

            String locate = req.getParameter("language");
            if (locate != null && !locate.isEmpty()) {
                vnp_Params.put("vnp_Locale", locate);
            } else {
                vnp_Params.put("vnp_Locale", "vn");
            }

            vnp_Params.put("vnp_ReturnUrl", Config.vnp_Returnurl);
            vnp_Params.put("vnp_IpAddr", vnp_IpAddr);

            Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
            SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
            String vnp_CreateDate = formatter.format(cld.getTime());

            vnp_Params.put("vnp_CreateDate", vnp_CreateDate);
            cld.add(Calendar.MINUTE, 15);
            String vnp_ExpireDate = formatter.format(cld.getTime());
            vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

            // Billing
            vnp_Params.put("vnp_Bill_Mobile", req.getParameter("txt_billing_mobile"));
            vnp_Params.put("vnp_Bill_Email", req.getParameter("txt_billing_email"));

            String fullName = (req.getParameter("txt_billing_fullname")).trim();
            if (fullName != null && !fullName.isEmpty()) {
                int idx = fullName.indexOf(' ');
                String firstName = fullName.substring(0, idx);
                String lastName = fullName.substring(fullName.lastIndexOf(' ') + 1);
                vnp_Params.put("vnp_Bill_FirstName", firstName);
                vnp_Params.put("vnp_Bill_LastName", lastName);
            }
            // Build data
            List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
            Collections.sort(fieldNames);
            StringBuilder hashData = new StringBuilder();
            StringBuilder query = new StringBuilder();

            Iterator<String> itr = fieldNames.iterator();
            while (itr.hasNext()) {
                String fieldName = itr.next();
                String fieldValue = vnp_Params.get(fieldName);
                if ((fieldValue != null) && (!fieldValue.isEmpty())) {
                    hashData.append(fieldName).append('=')
                            .append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8));

                    query.append(URLEncoder.encode(fieldName, StandardCharsets.UTF_8))
                            .append('=')
                            .append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8));

                    if (itr.hasNext()) {
                        query.append('&');
                        hashData.append('&');
                    }
                }
            }

            String queryUrl = query.toString();
            String vnp_SecureHash = Config.hmacSHA512(Config.vnp_HashSecret, hashData.toString());
            queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
            String paymentUrl = Config.vnp_PayUrl + "?" + queryUrl;


            result.put("code", "00");
            result.put("message", "success");
            result.put("data", paymentUrl);

            Wallet wallet = walletRepository.findByUserId(userID)
                    .orElseThrow(()->new AppException(ErrorCode.WALLET_NOT_EXIST));
            WalletTransaction walletTransaction = WalletTransaction.builder()
                    .wallet(wallet)
                    .transactionCode(vnp_TxnRef)
                    .amount(BigDecimal.valueOf(amount))
                    .balanceBefore(wallet.getBalance())
                    .balanceAfter(wallet.getBalance())
                    .status(WalletTransactionStatus.PENDING.name())
                    .description("Nạp tiền vào ví qua VNPAY")
                    .build();
            walletTransactionRepository.save(walletTransaction);


            return result;

        } catch (Exception e) {
            e.printStackTrace();

            error.put("code", "99");
            error.put("message", "error: " + e.getMessage());
            return  error;
        }

    }

    public String vnpReturn(HttpServletRequest request){
       String result = "";
        // Lấy tất cả params trả về từ VNPAY
        Map<String, String> fields = new HashMap<>();
        request.getParameterMap().forEach((key, values) -> {
            if (values.length > 0 && values[0] != null && !values[0].isEmpty()) {
                fields.put(key, values[0]);
            }
        });

        // Lấy secure hash từ VNPAY trả về
        String vnp_SecureHash = request.getParameter("vnp_SecureHash");

        // Xóa các field không cần trước khi ký
        fields.remove("vnp_SecureHashType");
        fields.remove("vnp_SecureHash");

        // Tính lại hash từ dữ liệu trả về
        String signValue = Config.hashAllFields(fields);

        // Kiểm tra chữ ký hợp lệ
        if (signValue.equals(vnp_SecureHash)) {
            // Kiểm tra mã phản hồi giao dịch
            String responseCode = request.getParameter("vnp_ResponseCode");
            if ("00".equals(responseCode)) {
               result= "GD thành công";
            } else {
                result = "GD Khong thanh cong";
            }
        } else {
            result = "Chu ky khong hop le";
        }
        return  result;
    }

}
