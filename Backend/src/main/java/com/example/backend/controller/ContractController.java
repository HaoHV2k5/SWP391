package com.example.backend.controller;

import java.util.Map;
import java.util.HashMap;
import java.lang.reflect.Field;
import java.util.List;

import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.response.ContractResponse;
import com.example.backend.service.ConstractService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.example.backend.service.EversignService;
import com.example.backend.dto.request.ContractCreateTemplateRequest;

import lombok.RequiredArgsConstructor;

import javax.print.attribute.standard.Media;

@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ContractController {


    private final EversignService eversignService;
    private final ConstractService constractService;

    // Endpoint duy nhất: tạo hợp đồng dùng template eversign
    @PreAuthorize("hasAuthority('ROLE_SELLER')")
    @PostMapping("/eversign/create-using-template")
    public ApiResponse<Map<String, Object>> createContractWithTemplate(@RequestBody ContractCreateTemplateRequest request) {
        Map<String, Object> map = eversignService.createDocumentUsingTemplate(request);
        return ApiResponse.<Map<String, Object>>builder().message("đã tạo hợp đồng thành công").data(map).build();
    }

    // handle eversign callback ve (webhook)

    @PostMapping("/eversign/webhook")
    public ApiResponse<String> handleWebHook(@RequestBody Map<String, Object> payload) {

        boolean check = eversignService.handleWebHook(payload);
        String result = check ? "buid true" : "buid false";
        return ApiResponse.<String>builder().message(result).build();

    }
    // api lay toan bo hop dong ma userid da tham gia
    @PreAuthorize("hasAnyAuthority('ROLE_SELLER','ROLE_USER')")
    @GetMapping("/contracts/user/{userId}")
    public ApiResponse<List<ContractResponse>> getContractsByUser(@PathVariable Long userId) {
        List<ContractResponse> contracts = constractService.getContractUserInvolved(userId);
        return ApiResponse.<List<ContractResponse>>builder().data(contracts).message("Lấy hợp đồng mà user đã tham gia thành công").build();
    }

    // api lay danh sach hop dong bi cancel
    @PreAuthorize("hasAnyAuthority('ROLE_SELLER','ROLE_USER')")
    @GetMapping("/contracts/cancel")
    public ApiResponse<List<ContractResponse>> getContractsCancle(@RequestParam Long userid){
        List<ContractResponse> list = constractService.getContractUserCancelled(userid);
        return ApiResponse.<List<ContractResponse>>builder()
                .data(list)
                .message("đã lấy danh sách hợp đồng bị cancel thành công!")
                .build();
    }


    //api xoa hop dong

    // api download hợp đồng dựa vào document_hash (chỉ co the tai hop dong complete)
    @PreAuthorize("hasAnyAuthority('ROLE_SELLER','ROLE_USER')")
    @GetMapping("/download")
    public ResponseEntity<byte[]> download(@RequestParam String contractHash){
        try {
        byte[] fileBytes = eversignService.downloadPdfConstract(contractHash);
        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.setContentType(MediaType.APPLICATION_PDF);
        httpHeaders.setContentDisposition(ContentDisposition.attachment()
                                                            .filename("cotract_"+contractHash+".pdf")
                                                            .build());
        MultiValueMap<String, String> headers;
        return  new ResponseEntity<>(fileBytes, httpHeaders, HttpStatus.OK);
    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(null);
    }



    }





    //api lay danh sach hop dong pending
    @PreAuthorize("hasAnyAuthority('ROLE_SELLER','ROLE_USER')")
    @GetMapping("/contracts/pending")
    public ApiResponse<List<ContractResponse>> getContractsPending(@RequestParam Long userid){
        List<ContractResponse> list = constractService.getContractUserPending(userid);
        return ApiResponse.<List<ContractResponse>>builder()
                .data(list)
                .message("đã lấy danh sách hợp đồng đang chờ kí thành công!")
                .build();
    }
    //api lau danh sach hop dong signed

    @PreAuthorize("hasAnyAuthority('ROLE_SELLER','ROLE_USER')")
    @GetMapping("/contracts/signed")
    public ApiResponse<List<ContractResponse>> getContractsSign(@RequestParam Long userid){
        List<ContractResponse> list = constractService.getContractUserPending(userid);
        return ApiResponse.<List<ContractResponse>>builder()
                .data(list)
                .message("đã lấy danh sách hợp đồng đã kí thành công!")
                .build();
    }

    @PreAuthorize("hasAnyAuthority('ROLE_USER','ROLE_SELLER')")
    @PostMapping("/contracts/{contractId}/pay")
    public ApiResponse<String> paySignedContract(@PathVariable Long contractId) {
        // Gọi service thực hiện thanh toán hợp đồng signed
        boolean success = constractService.payContractAfterSigned(contractId);
        if (success) {
            return ApiResponse.<String>builder()
                .message("Thanh toán thành công. Hệ thống đã giữ tiền cho đơn hàng.").build();
        } else {
            return ApiResponse.<String>builder()
                .message("Thanh toán thất bại. Vui lòng kiểm tra số dư hoặc trạng thái hợp đồng!").build();
        }
    }

    // API lấy toàn bộ hợp đồng cho admin và staff
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_STAFF')")
    @GetMapping("/contracts/all")
    public ApiResponse<List<ContractResponse>> getAllContracts() {
        List<ContractResponse> contracts = constractService.getAllContracts();
        return ApiResponse.<List<ContractResponse>>builder()
                .data(contracts)
                .message("Lấy toàn bộ hợp đồng thành công")
                .build();
    }


}
