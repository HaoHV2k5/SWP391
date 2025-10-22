package com.example.backend.service;


import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.example.backend.dto.request.ContractCreateTemplateRequest;
import com.example.backend.entity.Contract;
import com.example.backend.entity.User;
import com.example.backend.enums.ContractStatus;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;

import com.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;




import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EversignService {
    private final RestTemplate restTemplate;
//    private final ContractRepository contractRepository;
    private final UserRepository userRepository;
    private final OrderService orderService;

    @Value("${eversign.api.key}")
    private String apiKey;

    @Value("${eversign.api.url}")
    private String eversignUrl;

    @Value("${eversign.business_id}")
    private String businessId;



    public Map<String, Object> createDocumentUsingTemplate(ContractCreateTemplateRequest req) {
        try {
            // ✅ 1. Chuẩn bị nội dung gửi lên Eversign
            Map<String, Object> body = new HashMap<>();
            body.put("sandbox", 1); // test mode
            body.put("business_id", businessId);
            body.put("template_id", "7778b19a5f604936945c0d8e7fa9207c");
            body.put("title", "Hợp đồng mua bán xe điện");
            body.put("message", "Vui lòng kiểm tra và ký hợp đồng mua bán.");

            // ✅ 2. Thêm người ký (trùng role trong template)
            List<Map<String, Object>> signers = new ArrayList<>();
            signers.add(Map.of(
                    "role", "seller",
                    "name", req.getSellerName(),
                    "email", req.getSellerEmail(),
                    "signing_order", 1
            ));
            signers.add(Map.of(
                    "role", "buyer",
                    "name", req.getBuyerName(),
                    "email", req.getBuyerEmail(),
                    "signing_order", 2
            ));
            body.put("signers", signers);




            // ✅ 4. Chuẩn bị header
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // ✅ 5. Tạo HttpEntity chứa body + headers
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

            // ✅ 6. Gửi request POST tới Eversign
            String url = eversignUrl
                    + "/document?business_id=" + businessId
                    + "&access_key=" + apiKey;

            ResponseEntity<Map> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    request,
                    Map.class
            );

            // ✅ 7. Xử lý phản hồi từ Eversign
            Map<String, Object> result = new HashMap<>();
            if (response.getBody() != null) {
                Object documentHash = response.getBody().get("document_hash");
                result.put("document_hash", documentHash);
                result.put("eversign_response", response.getBody());
            } else {
                result.put("error", "Không nhận được phản hồi từ Eversign");
            }

            return result;

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Lỗi khi tạo hợp đồng với Eversign: " + e.getMessage());
        }
    }

}
