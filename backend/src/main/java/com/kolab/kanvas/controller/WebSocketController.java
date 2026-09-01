package com.kolab.kanvas.controller;

import com.kolab.kanvas.dto.ws.CursorMessage;
import com.kolab.kanvas.dto.ws.ElementOperationMessage;
import com.kolab.kanvas.dto.ws.PresenceMessage;
import com.kolab.kanvas.service.ConflictResolutionService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class WebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ConflictResolutionService conflictResolutionService;

    @MessageMapping("/board/{boardId}/edit")
    public void handleEditOperation(@DestinationVariable("boardId") String boardId,
                                    ElementOperationMessage message) {
        message.setBoardId(boardId);
        ElementOperationMessage resolved = conflictResolutionService.processElementOperation(message);
        messagingTemplate.convertAndSend("/topic/board/" + boardId + "/elements", resolved);
    }

    @MessageMapping("/board/{boardId}/cursor")
    public void handleCursorMove(@DestinationVariable("boardId") String boardId,
                                 CursorMessage message) {
        message.setBoardId(boardId);
        messagingTemplate.convertAndSend("/topic/board/" + boardId + "/cursors", message);
    }

    @MessageMapping("/board/{boardId}/presence")
    public void handlePresence(@DestinationVariable("boardId") String boardId,
                               PresenceMessage message) {
        message.setBoardId(boardId);
        messagingTemplate.convertAndSend("/topic/board/" + boardId + "/presence", message);
    }
}
