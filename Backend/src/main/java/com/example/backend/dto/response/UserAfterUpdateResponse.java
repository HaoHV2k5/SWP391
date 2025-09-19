package com.example.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserAfterUpdateResponse {
    Long id;
    String username;
    String phone;
    String fullname;
    String avatar;
    String gender;

    @JsonFormat(pattern = "dd/MM/yyyy")
    LocalDate yob;
    String address;
    boolean isVerified;
    private Boolean locked;
}
