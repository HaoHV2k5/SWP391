package com.example.backend.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorCode {
    UNCATEGORIZED(9999, "uncategorized", HttpStatus.INTERNAL_SERVER_ERROR),
    USER_EXISTED(1001, "user existed", HttpStatus.BAD_REQUEST),
    USERNAME_INVALID(1002, "username invalid", HttpStatus.BAD_REQUEST),
    PASSWORD_INVALID(1003, "password must be at least {min} characters long", HttpStatus.BAD_REQUEST),
    INVALID_KEY(1004, "invalid message key", HttpStatus.BAD_REQUEST),
    USER_NOT_EXISTED(1005, "user not existed", HttpStatus.NOT_FOUND),
    UNAUTHENTICATED(1006, "unauthenticated", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1007, "you do not have permission", HttpStatus.FORBIDDEN),
    INVALID_DOB(1008, "you must be at least {min} years old", HttpStatus.BAD_REQUEST),
    PASSWORD_NOT_BLANK(1009, "password must not be blank", HttpStatus.BAD_REQUEST),
    CONFIRM_PASSWORD_NOT_BLANK(1010, "confirm password must not be blank", HttpStatus.BAD_REQUEST),
    EMAIL_NOT_BLANK(1011, "email must not be blank", HttpStatus.BAD_REQUEST),
    EMAIL_INVALID(1012, "email is invalid", HttpStatus.BAD_REQUEST),
    FULLNAME_NOT_BLANK(1013, "fullname must be not blank", HttpStatus.BAD_REQUEST),
    YOB_NOT_BLANK(1014, "yob must be not blank", HttpStatus.BAD_REQUEST),

    PHONE_INVALID(1014, "phone is not valid", HttpStatus.BAD_REQUEST),
    DATE_FORMAT_INVALID(1014, "Date format is not valid", HttpStatus.BAD_REQUEST),
    PASSWORD_NOT_MATCH(1015, "password do not match", HttpStatus.BAD_REQUEST),
    USERNAME_NOT_BLANK(1011, "username must not be blank", HttpStatus.BAD_REQUEST),
    EMAIL_SEND_UNSUCCESS(1011, "username must not be blank", HttpStatus.BAD_REQUEST),

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
