package com.kolab.kanvas.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider(
                "test-secret-key-kanvas-collaboration-whiteboard-2026-production-ready",
                900000L,
                604800000L
        );
    }

    @Test
    void testGenerateAndValidateAccessToken() {
        String token = jwtTokenProvider.generateAccessToken("user-123", "test@kanvas.app");
        assertNotNull(token);
        assertTrue(jwtTokenProvider.validateToken(token));
        assertEquals("user-123", jwtTokenProvider.getUserIdFromToken(token));
        assertEquals("test@kanvas.app", jwtTokenProvider.getEmailFromToken(token));
    }

    @Test
    void testInvalidateToken() {
        String token = jwtTokenProvider.generateAccessToken("user-123", "test@kanvas.app");
        assertTrue(jwtTokenProvider.validateToken(token));
        jwtTokenProvider.invalidateToken(token);
        assertFalse(jwtTokenProvider.validateToken(token));
    }
}
