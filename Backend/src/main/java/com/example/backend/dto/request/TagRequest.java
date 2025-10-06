package com.example.backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TagRequest {
    private String slugs;
    private String displayName;
    private String brand;
    private String model;
    private Integer yearModel;
    private  String type;

}
