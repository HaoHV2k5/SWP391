package com.example.backend.enums;

public enum ContractStatus {
    PENDING("PENDING"),
    SIGNED("SIGNED"),
    COMPLETED("COMPLETED"),
    CANCELLED("CANCELLED"),
    DISPUTED("DISPUTED");

    private final String value;

    ContractStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}
