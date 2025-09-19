package com.example.backend.dto.request;


import com.example.backend.validation.DobConstrain;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor

public class AdminUpdateUserRequest {
    @Size(max = 100, message = "Fullname must not exceed 100 characters")
    @NotEmpty(message = "FULLNAME_NOT_BLANK")
    private String fullname;

    private String avatar;

    @Pattern(regexp = "^(Male|Female|Other)$", message = "Gender must be Male, Female, or Other")
    private String gender;

    @DobConstrain(min = 18)
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate yob;

    @Pattern(regexp = "^(84|0[35789])[0-9]{8}\\b", message = "PHONE_INVALID" )
    private String phone;

    @Size(max = 255, message = "Address must not exceed 255 characters")
    private String address;

    private Boolean isVerified;
}
