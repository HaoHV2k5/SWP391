package com.example.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor

public class SellerResponse {
    private String fullname;
    private double rating;
    private boolean kycStatus;
    private int review;
    private String address;
    private int totalListing;
    private int totalSold;
    private  String phone;
}
