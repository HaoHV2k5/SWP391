package com.example.backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.bind.annotation.RequestParam;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ContractCreateTemplateRequest {

    private String sellerName;
    private String sellerEmail;
    private String buyerName;
    private String buyerEmail;
    private Long orderId;
}
