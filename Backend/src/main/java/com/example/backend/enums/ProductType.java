package com.example.backend.enums;

public enum ProductType {
    VEHICLE("VEHICLE"), // xe máy điện / xe tay ga điện
    BATTERY("BATTERY"),
    POSTING_PACKAGE("POSTING_PACKAGE");

    private final String value;

    ProductType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}
