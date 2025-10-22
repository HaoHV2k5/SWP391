package com.example.backend.enums;

public enum EscrowStatus {
    HELD, // Đang giữ tiền, chờ xác nhận nhận hàng
    AWAIT_CONFIRM, // Đang chờ buyer xác nhận nhận hàng
    ADMIN_REVIEW, // Seller đã gửi minh chứng lên admin
    RELEASED, // Đã chuyển tiền cho seller
    REFUNDED, // Đã hoàn cho user, dự phòng nếu cần
    ADMIN_REJECTED // Admin đã kiểm tra nhưng từ chối minh chứng Seller
}
