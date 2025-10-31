package com.example.backend.dto.request;

import lombok.Data;

import java.math.BigDecimal;
@Data
public class CreatePostingRequest {
    private String name;
    private String description;
    private BigDecimal price;
    private Integer duration;
    private Integer postLimit;
    private Boolean isActive;
    private Boolean requireApproval;

}
