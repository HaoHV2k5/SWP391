package com.example.backend.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorCode {
    UNCATEGORIZED(9999, "Lỗi không xác định", HttpStatus.INTERNAL_SERVER_ERROR),
    USER_EXISTED(1001, "Người dùng đã tồn tại", HttpStatus.BAD_REQUEST),
    USERNAME_INVALID(1002, "Tên người dùng không hợp lệ", HttpStatus.BAD_REQUEST),
    PASSWORD_INVALID(1003, "Mật khẩu phải có ít nhất {min} ký tự", HttpStatus.BAD_REQUEST),
    INVALID_KEY(1004, "Khóa thông báo không hợp lệ", HttpStatus.BAD_REQUEST),
    USER_NOT_EXISTED(1005, "Người dùng không tồn tại", HttpStatus.NOT_FOUND),
    UNAUTHENTICATED(1006, "Chưa xác thực", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1007, "Bạn không có quyền truy cập", HttpStatus.FORBIDDEN),
    INVALID_DOB(1008, "Bạn phải ít nhất {min} tuổi", HttpStatus.BAD_REQUEST),
    PASSWORD_NOT_BLANK(1009, "Mật khẩu không được để trống", HttpStatus.BAD_REQUEST),
    CONFIRM_PASSWORD_NOT_BLANK(1010, "Xác nhận mật khẩu không được để trống", HttpStatus.BAD_REQUEST),
    EMAIL_NOT_BLANK(1011, "Email không được để trống", HttpStatus.BAD_REQUEST),
    EMAIL_INVALID(1012, "Email không hợp lệ", HttpStatus.BAD_REQUEST),
    FULLNAME_NOT_BLANK(1013, "Họ tên không được để trống", HttpStatus.BAD_REQUEST),
    YOB_NOT_BLANK(1014, "Năm sinh không được để trống", HttpStatus.BAD_REQUEST),

    PHONE_INVALID(1015, "Số điện thoại không hợp lệ", HttpStatus.BAD_REQUEST),
    DATE_FORMAT_INVALID(1016, "Định dạng ngày không hợp lệ", HttpStatus.BAD_REQUEST),
    PASSWORD_NOT_MATCH(1017, "Mật khẩu không khớp", HttpStatus.BAD_REQUEST),
    USERNAME_NOT_BLANK(1018, "Tên người dùng không được để trống", HttpStatus.BAD_REQUEST),
    EMAIL_SEND_UNSUCCESS(1019, "Gửi email thất bại", HttpStatus.BAD_REQUEST),
    ROLE_NOT_EXISTED(1020, "Vai trò không tồn tại", HttpStatus.NOT_FOUND),
    OTP_NOT_VERIFY (1021, "Tài khoản chưa được xác thực bằng OTP", HttpStatus.BAD_REQUEST),
    ACCOUNT_LOCKED(1022, "Tài khoản đã bị khóa", HttpStatus.FORBIDDEN),
    OTP_INVALID (1023, "OTP không đúng!, hãy thử lại", HttpStatus.BAD_REQUEST),
    USER_ROLE_NOT_FOUND (1023, "Không tìm thấy User role trong hệ thống!", HttpStatus.BAD_REQUEST),

    ACCOUNT_EXISTED (1023, "Email này đã được sử dụng", HttpStatus.BAD_REQUEST),
    USER_NOT_FOUND (1024, "Người dùng không tồn tại", HttpStatus.NOT_FOUND),
    PRODUCT_NOT_FOUND (1025, "Sản phẩm không tồn tại", HttpStatus.NOT_FOUND),
    INVALID_CREDENTIALS (1026, "Thông tin xác thực không hợp lệ", HttpStatus.FORBIDDEN),
    
    // Product validation errors
    TITLE_REQUIRED (1027, "Tiêu đề sản phẩm không được để trống", HttpStatus.BAD_REQUEST),
    TITLE_TOO_LONG (1028, "Tiêu đề sản phẩm không được vượt quá 255 ký tự", HttpStatus.BAD_REQUEST),
    DESCRIPTION_TOO_LONG (1029, "Mô tả sản phẩm không được vượt quá 1000 ký tự", HttpStatus.BAD_REQUEST),
    PRICE_REQUIRED (1030, "Giá sản phẩm không được để trống", HttpStatus.BAD_REQUEST),
    PRICE_INVALID (1031, "Giá sản phẩm phải lớn hơn 0", HttpStatus.BAD_REQUEST),
    PRODUCT_TYPE_REQUIRED (1032, "Loại sản phẩm không được để trống", HttpStatus.BAD_REQUEST),
    BRAND_TOO_LONG (1033, "Tên thương hiệu không được vượt quá 255 ký tự", HttpStatus.BAD_REQUEST),
    MODEL_TOO_LONG (1034, "Tên model không được vượt quá 255 ký tự", HttpStatus.BAD_REQUEST),
    YEAR_MANUFACTURED_INVALID (1035, "Năm sản xuất phải từ 1900 đến 2030", HttpStatus.BAD_REQUEST),
    BATTERY_LEVEL_INVALID (1036, "Mức pin phải từ 0 đến 100", HttpStatus.BAD_REQUEST),
    KYC_NOT_EXISTED (1037, "không có KYC nào tồn tại", HttpStatus.BAD_REQUEST),
    PERMISSION_NOT_EXISTED (1038, "Permission này tồn tại", HttpStatus.BAD_REQUEST),
    PRODUCT_NOT_ACCEPT_BY_ADMIN (1039, "Product này vẫn chưa được admin chấp nhận", HttpStatus.BAD_REQUEST),

    ;
    private int code;
    private String message;
    private HttpStatusCode  httpStatusCode;
     private ErrorCode(int code, String message, HttpStatusCode httpStatusCode){
        this.code = code;
        this.message = message;
        this.httpStatusCode = httpStatusCode;
    }

}
