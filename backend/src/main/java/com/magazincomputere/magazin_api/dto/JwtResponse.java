package com.magazincomputere.magazin_api.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String username;
    private String email;
    private String avatarImageBase64;
    private List<String> roles; // Lista de roluri (ex: ["ROLE_USER", "ROLE_ADMIN"])

    public JwtResponse(String accessToken, Long id, String username, String email, String avatarImageBase64, List<String> roles) {
        this.token = accessToken;
        this.id = id;
        this.username = username;
        this.email = email;
        this.avatarImageBase64 = avatarImageBase64;
        this.roles = roles;
    }
}