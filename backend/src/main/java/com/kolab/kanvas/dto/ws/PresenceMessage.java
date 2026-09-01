package com.kolab.kanvas.dto.ws;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PresenceMessage {

    private String type; // JOIN, LEAVE
    private String boardId;
    private String userId;
    private String userName;
    private String avatarUrl;
    private long timestamp;
}
