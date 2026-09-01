package com.kolab.kanvas.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShareLink {

    private String token;
    @Builder.Default
    private String defaultRole = "VIEWER";
    private Instant expiresAt;
    private String passwordHash;
}
