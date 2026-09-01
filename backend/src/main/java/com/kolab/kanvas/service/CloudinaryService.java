package com.kolab.kanvas.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class CloudinaryService {

    @Value("${cloudinary.cloud-name:}")
    private String cloudName;

    @Value("${cloudinary.api-key:}")
    private String apiKey;

    @Value("${cloudinary.api-secret:}")
    private String apiSecret;

    public Map<String, Object> generateSignedUploadParams(String folder) {
        long timestamp = System.currentTimeMillis() / 1000L;

        Map<String, Object> params = new HashMap<>();
        params.put("timestamp", timestamp);
        if (folder != null && !folder.isBlank()) {
            params.put("folder", folder);
        }

        if (cloudName != null && !cloudName.isBlank() && apiSecret != null && !apiSecret.isBlank()) {
            try {
                Cloudinary cloudinary = new Cloudinary(ObjectUtils.asMap(
                        "cloud_name", cloudName,
                        "api_key", apiKey,
                        "api_secret", apiSecret
                ));
                String signature = cloudinary.apiSignRequest(params, apiSecret);
                params.put("signature", signature);
                params.put("api_key", apiKey);
                params.put("cloud_name", cloudName);
            } catch (Exception e) {
                log.error("Failed to generate Cloudinary signature", e);
            }
        } else {
            // Demo upload token for development without cloud secrets
            params.put("signature", "demo-signature-" + timestamp);
            params.put("api_key", "demo-key");
            params.put("cloud_name", "kanvas-demo");
        }

        return params;
    }
}
