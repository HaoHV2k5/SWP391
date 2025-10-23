package com.example.backend.service;


import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.example.backend.dto.request.ContractCreateTemplateRequest;
import com.example.backend.entity.Contract;
import com.example.backend.entity.Order;
import com.example.backend.entity.Product;
import com.example.backend.entity.User;
import com.example.backend.enums.ContractStatus;
import com.example.backend.enums.OrderStatus;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;

import com.example.backend.repository.ContractRepository;
import com.example.backend.repository.OrderRespository;
import com.example.backend.repository.ProductRepository;
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
    private final OrderService orderService;
    private final ContractRepository contractRepository;
    private final OrderRespository orderRespository;
    private final ProductRepository productRepository;

    @Value("${eversign.api.key}")
    private String apiKey;

    @Value("${eversign.api.url}")
    private String eversignUrl;

    @Value("${eversign.business_id}")
    private String businessId;



    public Map<String, Object> createDocumentUsingTemplate(ContractCreateTemplateRequest req) {
        try {
            //  1. Chuẩn bị nội dung gửi lên Eversign
            Map<String, Object> body = new HashMap<>();
            body.put("sandbox", 1); // test mode
            body.put("business_id", businessId);
            body.put("template_id", "7778b19a5f604936945c0d8e7fa9207c");
            body.put("title", "Hợp đồng mua bán xe điện");
            body.put("message", "Vui lòng kiểm tra và ký hợp đồng mua bán.");

            // 2. Thêm người ký (trùng role trong template)
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




            //  4. Chuẩn bị header
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

            // 7. Xử lý phản hồi từ Eversign
            Map<String, Object> result = new HashMap<>();
            if (response.getBody() != null) {
                Object documentHash = response.getBody().get("document_hash");
                if(documentHash == null) {
                    throw new AppException(ErrorCode.CONTRACT_BUID_FALID);
                }
                result.put("document_hash", documentHash);
                result.put("eversign_response", response.getBody());
                String term =
                        """
                            Bên mua thanh toán qua ví hệ thống khi hai bên xác nhận giao dịch.
                            Số tiền được giữ lại và chỉ chuyển cho bên bán nếu:
                            1. Sau 3 ngày kể từ khi bên mua xác nhận nhận hàng thành công.
                            2. Hoặc bên bán gửi yêu cầu có kèm mã vận chuyển và hình ảnh xác minh giao hàng.
                            Nếu đơn hàng lỗi, bên mua có quyền gửi khiếu nại trong 3 ngày.
                        """;
                // cap nhat trang thai order dc nhan
                Order order = orderService.findById(req.getOrderId());
                order.setStatus(OrderStatus.ACCEPTED);
                orderRespository.save(order);
                Product product = order.getProduct();
                product.setPosted(false);
                productRepository.save(product);
                // tu choi va gui email cho tat ca cac ng bi tu choi
                orderService.rejectAll(req.getOrderId());


                Contract contract = Contract.builder()
                        .contractCode(documentHash.toString())
                        .seller(order.getSeller())
                        .buyer(order.getBuyer())
                        .agreedPrice(order.getOfferedPrice())
                        .terms(term)
                        .order(order)
                        .product(order.getProduct())
                        .signedAt(LocalDateTime.now())
                        .build();
                contractRepository.save(contract);

            } else {
                result.put("error", "Không nhận được phản hồi từ Eversign");
            }

            return result;

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Lỗi khi tạo hợp đồng với Eversign: " + e.getMessage());
        }
    }


    public boolean handleWebHook(Map<String, Object> payload) {
        try {
            String eventType = (String) payload.get("event_type");

            // Lấy meta -> related_document_hash
            Map<String, Object> meta = (Map<String, Object>) payload.get("meta");
            String documentHash = meta != null ? (String) meta.get("related_document_hash") : null;

            if (documentHash == null) {
                System.err.println("Không có related_document_hash trong payload!");
                return false;
            }

            // Lấy thông tin signer (nếu có)
            Map<String, Object> signer = (Map<String, Object>) payload.get("signer");
            String signerId = signer != null ? (String) signer.get("id") : null;

            System.out.printf("📄 Event: %s | Document: %s | Signer: %s%n",
                    eventType, documentHash, signerId);
            Contract contract = contractRepository.findByContractCode(documentHash);
            if(contract == null) {
                throw new AppException(ErrorCode.CONTRACT_BUID_FALID);
            }
            //  Nếu tài liệu đã hoàn tất ký
            if ("document_completed".equals(eventType)) {


                    contract.setStatus(ContractStatus.SIGNED);
                    contract.setSignedAt(LocalDateTime.now());

                    contractRepository.save(contract);
                    System.out.println("Hợp đồng " + documentHash + " đã hoàn tất ký!");

            }

            //  Nếu người ký đã ký (một bên)
            if ("document_signed".equals(eventType)) {
                if ("1".equals(signerId)) {
                    contract.setSellerSigned(true);

                }
                else if ("2".equals(signerId)) {
                    contract.setBuyerSigned(true);
                }
                contractRepository.save(contract);
                System.out.println("✍️ Có người vừa ký tài liệu " + documentHash);
            }
            if("document_declined".equals(eventType)) {
                contract.setStatus(ContractStatus.CANCELLED);
                contractRepository.save(contract);
                System.out.println(" Hợp đồng " + documentHash + " đã bị từ chối ký!");
            }

            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }


}
