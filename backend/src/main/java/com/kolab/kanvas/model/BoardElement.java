package com.kolab.kanvas.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BoardElement {

    private String elementId;
    private String type; // rect, ellipse, line, arrow, freehand, text, sticky, image
    @Builder.Default
    private Map<String, Object> props = new HashMap<>();
    private int zIndex;
    @Builder.Default
    private int version = 1;
    private String lastEditedBy;
    private Instant lastEditedAt;
}
