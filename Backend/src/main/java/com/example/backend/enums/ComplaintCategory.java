package com.example.backend.enums;

public enum ComplaintCategory {
    PRODUCT_QUALITY("PRODUCT_QUALITY"),
    DAMAGED_ITEM("DAMAGED_ITEM"),
    NOT_AS_DESCRIBED("NOT_AS_DESCRIBED"),
    OTHER("OTHER");

    private final String value;

    ComplaintCategory(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}
