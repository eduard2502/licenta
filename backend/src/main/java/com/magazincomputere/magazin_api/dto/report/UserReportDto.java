package com.magazincomputere.magazin_api.dto.report;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserReportDto {
    private Integer totalUsers;
    private Integer activeUsers;
    private Integer newUsersThisMonth;
    private List<UserRoleCountDto> usersByRole;
    private List<UserInfoDto> recentRegistrations;
}