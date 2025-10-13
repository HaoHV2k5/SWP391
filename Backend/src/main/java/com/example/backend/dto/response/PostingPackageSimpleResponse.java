package com.example.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PostingPackageSimpleResponse {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private Integer duration;
    private Integer postLimit;
    private Boolean isActive;

}
