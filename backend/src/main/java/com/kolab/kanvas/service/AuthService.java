package com.kolab.kanvas.service;

import com.kolab.kanvas.dto.*;
import com.kolab.kanvas.model.User;
import com.kolab.kanvas.repository.UserRepository;
import com.kolab.kanvas.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail().toLowerCase())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is already registered");
        }

        User user = User.builder()
                .name(request.getName().trim())
                .email(request.getEmail().toLowerCase().trim())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .roles(Set.of("ROLE_USER"))
                .avatarUrl("https://api.dicebear.com/7.x/bottts/svg?seed=" + request.getEmail())
                .build();

        User savedUser = userRepository.save(user);

        String accessToken = jwtTokenProvider.generateAccessToken(savedUser.getId(), savedUser.getEmail());
        String refreshToken = jwtTokenProvider.generateRefreshToken(savedUser.getId(), savedUser.getEmail());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .user(UserDto.fromEntity(savedUser))
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId(), user.getEmail());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .user(UserDto.fromEntity(user))
                .build();
    }

    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid or expired refresh token");
        }

        String userId = jwtTokenProvider.getUserIdFromToken(refreshToken);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        String newAccessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail());
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(user.getId(), user.getEmail());

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .tokenType("Bearer")
                .user(UserDto.fromEntity(user))
                .build();
    }

    public void logout(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            jwtTokenProvider.invalidateToken(token);
        }
    }

    public void changePassword(User currentUser, ChangePasswordRequest request) {
        if (!passwordEncoder.matches(request.getOldPassword(), currentUser.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current password is incorrect");
        }

        currentUser.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(currentUser);
    }

    public AuthResponse googleLogin(GoogleAuthRequest request) {
        String token = request.getToken();
        String email = request.getEmail() != null ? request.getEmail().toLowerCase().trim() : null;
        String name = request.getName();
        String avatarUrl = request.getAvatarUrl();

        // If email is not passed directly, parse the Google ID Token JWT payload
        if ((email == null || email.isBlank()) && token != null && !token.isBlank()) {
            if (token.contains(".")) {
                try {
                    String[] parts = token.split("\\.");
                    if (parts.length >= 2) {
                        String payloadJson = new String(java.util.Base64.getUrlDecoder().decode(parts[1]), java.nio.charset.StandardCharsets.UTF_8);
                        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                        com.fasterxml.jackson.databind.JsonNode node = mapper.readTree(payloadJson);

                        if (node.has("email")) {
                            email = node.get("email").asText().toLowerCase().trim();
                        }
                        if ((name == null || name.isBlank()) && node.has("name")) {
                            name = node.get("name").asText();
                        }
                        if ((avatarUrl == null || avatarUrl.isBlank()) && node.has("picture")) {
                            avatarUrl = node.get("picture").asText();
                        }
                    }
                } catch (Exception e) {
                    log.warn("Could not parse Google ID token payload: {}", e.getMessage());
                }
            }

            // Fallback for mock tokens / dev testing
            if (email == null || email.isBlank()) {
                String sanitizedToken = token.replaceAll("[^a-zA-Z0-9]", "");
                email = "user_" + (sanitizedToken.length() > 8 ? sanitizedToken.substring(0, 8) : sanitizedToken) + "@google.com";
            }
        }

        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Google authentication credential token or email is required");
        }

        final String finalEmail = email;
        final String finalName = (name != null && !name.isBlank()) ? name : email.split("@")[0];
        final String finalAvatar = (avatarUrl != null && !avatarUrl.isBlank()) ? avatarUrl : "https://api.dicebear.com/7.x/bottts/svg?seed=" + email;

        User user = userRepository.findByEmail(finalEmail).orElseGet(() -> {
            User newUser = User.builder()
                    .name(finalName)
                    .email(finalEmail)
                    .passwordHash(passwordEncoder.encode(java.util.UUID.randomUUID().toString()))
                    .roles(Set.of("ROLE_USER"))
                    .avatarUrl(finalAvatar)
                    .build();
            return userRepository.save(newUser);
        });

        String accessToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId(), user.getEmail());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .user(UserDto.fromEntity(user))
                .build();
    }
}
