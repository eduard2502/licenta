package com.magazincomputere.magazin_api.dto.report;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserInfoDto {
    private Long id;
    private String username;
    private String email;
    private LocalDateTime registrationDate;
    private LocalDateTime lastLoginDate;
    private Boolean isActive;
}