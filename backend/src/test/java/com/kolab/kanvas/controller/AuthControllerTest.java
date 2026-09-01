package com.kolab.kanvas.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kolab.kanvas.dto.AuthResponse;
import com.kolab.kanvas.dto.LoginRequest;
import com.kolab.kanvas.dto.RegisterRequest;
import com.kolab.kanvas.dto.UserDto;
import com.kolab.kanvas.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @MockBean
    private com.kolab.kanvas.repository.UserRepository userRepository;

    @MockBean
    private com.kolab.kanvas.repository.BoardRepository boardRepository;

    @MockBean
    private com.kolab.kanvas.repository.SummaryRepository summaryRepository;

    @MockBean
    private com.kolab.kanvas.repository.TranscriptRepository transcriptRepository;

    @MockBean
    private org.springframework.data.mongodb.core.MongoTemplate mongoTemplate;

    @MockBean
    private org.springframework.data.mongodb.core.convert.MappingMongoConverter mappingMongoConverter;

    @MockBean
    private org.springframework.data.mongodb.gridfs.GridFsTemplate gridFsTemplate;

    @MockBean
    private org.springframework.data.redis.core.StringRedisTemplate redisTemplate;

    @Test
    void testRegisterEndpoint() throws Exception {
        RegisterRequest req = RegisterRequest.builder()
                .name("Test User")
                .email("test@kanvas.app")
                .password("password123")
                .build();

        AuthResponse resp = AuthResponse.builder()
                .accessToken("mock-token")
                .refreshToken("mock-refresh")
                .user(UserDto.builder().id("u1").name("Test User").email("test@kanvas.app").build())
                .build();

        when(authService.register(any())).thenReturn(resp);

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("mock-token"))
                .andExpect(jsonPath("$.user.email").value("test@kanvas.app"));
    }

    @Test
    void testLoginEndpoint() throws Exception {
        LoginRequest req = LoginRequest.builder()
                .email("test@kanvas.app")
                .password("password123")
                .build();

        AuthResponse resp = AuthResponse.builder()
                .accessToken("mock-token")
                .user(UserDto.builder().id("u1").email("test@kanvas.app").build())
                .build();

        when(authService.login(any())).thenReturn(resp);

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("mock-token"));
    }
}
