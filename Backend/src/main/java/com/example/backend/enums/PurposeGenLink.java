package com.example.backend.enums;

public enum PurposeGenLink {
    RECHARGE("recharge"),
    BUY("buy");


    private String value;

    PurposeGenLink(String value) {
        this.value = value;
    }
}
