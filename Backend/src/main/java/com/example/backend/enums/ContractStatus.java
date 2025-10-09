package com.example.backend.enums;

import lombok.Getter;

@Getter
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

}
