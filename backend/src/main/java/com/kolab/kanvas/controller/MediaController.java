package com.kolab.kanvas.controller;

import com.kolab.kanvas.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/media")
@RequiredArgsConstructor
public class MediaController {

    private final CloudinaryService cloudinaryService;

    @GetMapping("/signed-params")
    public ResponseEntity<Map<String, Object>> getSignedParams(@RequestParam(value = "folder", defaultValue = "kanvas_media") String folder) {
        return ResponseEntity.ok(cloudinaryService.generateSignedUploadParams(folder));
    }
}
