package com.kolab.kanvas.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoogleAuthRequest {

    private String credential;
    private String idToken;
    private String name;
    private String email;
    private String avatarUrl;

    public String getToken() {
        if (credential != null && !credential.isBlank()) return credential;
        if (idToken != null && !idToken.isBlank()) return idToken;
        return null;
    }
}
