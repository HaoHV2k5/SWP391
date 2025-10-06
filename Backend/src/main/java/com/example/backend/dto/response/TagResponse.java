package com.example.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TagResponse {
    private String slugs;
    private String displayName;
    private String brand;
    private String model;
    private Integer yearModel;
    private String type;
}
