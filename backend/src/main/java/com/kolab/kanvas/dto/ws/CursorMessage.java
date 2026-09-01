package com.kolab.kanvas.dto.ws;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CursorMessage {

    private String type; // CURSOR_MOVE
    private String boardId;
    private String userId;
    private String userName;
    private String color;
    private double x;
    private double y;
}
