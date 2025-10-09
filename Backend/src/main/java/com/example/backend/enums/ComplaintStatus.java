package com.example.backend.enums;

public enum ComplaintStatus {
    PENDING("PENDING"),
    UNDER_REVIEW("UNDER_REVIEW"),
    RESOLVED_BUYER_FAVOR("RESOLVED_BUYER_FAVOR"),
    RESOLVED_SELLER_FAVOR("RESOLVED_SELLER_FAVOR"),
    CLOSED("CLOSED");

    private final String value;

    ComplaintStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}
