package com.kolab.kanvas.dto.ws;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ElementOperationMessage {

    private String type; // ELEMENT_CREATE, ELEMENT_UPDATE, ELEMENT_DELETE, ELEMENT_MOVE
    private String boardId;
    private String elementId;
    private String op; // CREATE, UPDATE, DELETE, MOVE
    private Map<String, Object> payload;
    private int clientVersion;
    private String userId;
    private String userName;
    private long timestamp;
}
