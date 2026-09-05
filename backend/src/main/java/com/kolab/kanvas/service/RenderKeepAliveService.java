package com.kolab.kanvas.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Service
public class RenderKeepAliveService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${app.render.service-url:http://localhost:8080}")
    private String renderServiceUrl;

    // Run every 8 minutes (480,000 ms) to prevent Render 15-min inactivity sleep
    @Scheduled(fixedRate = 480000, initialDelay = 60000)
    public void pingSelf() {
        try {
            String pingUrl = renderServiceUrl.endsWith("/") 
                    ? renderServiceUrl + "api/v1/ping" 
                    : renderServiceUrl + "/api/v1/ping";
            log.info("Sending self-ping to keep container alive: {}", pingUrl);
            String response = restTemplate.getForObject(pingUrl, String.class);
            log.info("Self-ping response: {}", response);
        } catch (Exception e) {
            log.warn("Self-ping failed (harmless during local dev or startup): {}", e.getMessage());
        }
    }
}
