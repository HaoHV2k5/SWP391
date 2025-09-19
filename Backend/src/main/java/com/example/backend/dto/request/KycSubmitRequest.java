package com.example.backend.dto.request;

import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
public class KycSubmitRequest {
    private MultipartFile frontImage;
    private MultipartFile backImage;
}


