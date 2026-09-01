package com.kolab.kanvas.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class RedisPublisher {

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    public void publish(String topic, Object message) {
        try {
            String jsonPayload = objectMapper.writeValueAsString(message);
            redisTemplate.convertAndSend(topic, jsonPayload);
        } catch (Exception e) {
            log.error("Failed to publish message to Redis topic: {}", topic, e);
        }
    }
}
