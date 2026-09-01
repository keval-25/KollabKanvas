package com.kolab.kanvas.service;

import com.kolab.kanvas.dto.AuthResponse;
import com.kolab.kanvas.dto.LoginRequest;
import com.kolab.kanvas.dto.RegisterRequest;
import com.kolab.kanvas.model.User;
import com.kolab.kanvas.repository.UserRepository;
import com.kolab.kanvas.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private AuthService authService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testRegisterSuccess() {
        RegisterRequest request = RegisterRequest.builder()
                .name("Alex")
                .email("alex@kanvas.app")
                .password("password123")
                .build();

        User user = User.builder()
                .id("u1")
                .name("Alex")
                .email("alex@kanvas.app")
                .passwordHash("hashedPass")
                .build();

        when(userRepository.existsByEmail("alex@kanvas.app")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("hashedPass");
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(jwtTokenProvider.generateAccessToken(any(), any())).thenReturn("mockAccess");
        when(jwtTokenProvider.generateRefreshToken(any(), any())).thenReturn("mockRefresh");

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("mockAccess", response.getAccessToken());
        assertEquals("alex@kanvas.app", response.getUser().getEmail());
    }

    @Test
    void testLoginSuccess() {
        LoginRequest request = LoginRequest.builder()
                .email("alex@kanvas.app")
                .password("password123")
                .build();

        User user = User.builder()
                .id("u1")
                .name("Alex")
                .email("alex@kanvas.app")
                .passwordHash("hashedPass")
                .build();

        when(userRepository.findByEmail("alex@kanvas.app")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password123", "hashedPass")).thenReturn(true);
        when(jwtTokenProvider.generateAccessToken(any(), any())).thenReturn("mockAccess");
        when(jwtTokenProvider.generateRefreshToken(any(), any())).thenReturn("mockRefresh");

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("mockAccess", response.getAccessToken());
    }
}
