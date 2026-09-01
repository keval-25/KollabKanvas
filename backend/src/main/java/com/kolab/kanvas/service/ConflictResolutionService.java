package com.kolab.kanvas.service;

import com.kolab.kanvas.dto.ws.ElementOperationMessage;
import com.kolab.kanvas.model.Board;
import com.kolab.kanvas.model.BoardElement;
import com.kolab.kanvas.repository.BoardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ConflictResolutionService {

    private final BoardRepository boardRepository;

    public ElementOperationMessage processElementOperation(ElementOperationMessage message) {
        Optional<Board> boardOpt = boardRepository.findById(message.getBoardId());
        if (boardOpt.isEmpty()) {
            return message;
        }

        Board board = boardOpt.get();
        if (board.getElements() == null) {
            board.setElements(new ArrayList<>());
        }

        String op = message.getOp();
        String elementId = message.getElementId();

        if ("CREATE".equalsIgnoreCase(op)) {
            BoardElement newElement = BoardElement.builder()
                    .elementId(elementId)
                    .type((String) message.getPayload().getOrDefault("type", "rect"))
                    .props(message.getPayload())
                    .zIndex((int) message.getPayload().getOrDefault("zIndex", board.getElements().size() + 1))
                    .version(1)
                    .lastEditedBy(message.getUserId())
                    .lastEditedAt(Instant.ofEpochMilli(message.getTimestamp()))
                    .build();

            board.getElements().add(newElement);
            message.setClientVersion(1);
        } else if ("UPDATE".equalsIgnoreCase(op) || "MOVE".equalsIgnoreCase(op)) {
            Optional<BoardElement> existingOpt = board.getElements().stream()
                    .filter(e -> e.getElementId().equals(elementId))
                    .findFirst();

            if (existingOpt.isPresent()) {
                BoardElement existing = existingOpt.get();
                int currentVersion = existing.getVersion();

                if (message.getClientVersion() >= currentVersion) {
                    // Match or ahead -> apply payload update, increment version
                    existing.getProps().putAll(message.getPayload());
                    existing.setVersion(currentVersion + 1);
                    existing.setLastEditedBy(message.getUserId());
                    existing.setLastEditedAt(Instant.ofEpochMilli(message.getTimestamp()));
                    message.setClientVersion(existing.getVersion());
                } else {
                    // Stale version conflict resolution: Field-level merge with LWW server timestamp (§5.3)
                    Map<String, Object> mergedProps = new HashMap<>(existing.getProps());
                    mergedProps.putAll(message.getPayload());
                    existing.setProps(mergedProps);
                    existing.setVersion(currentVersion + 1);
                    existing.setLastEditedBy(message.getUserId());
                    existing.setLastEditedAt(Instant.ofEpochMilli(message.getTimestamp()));
                    message.setClientVersion(existing.getVersion());
                }
            }
        } else if ("DELETE".equalsIgnoreCase(op)) {
            board.getElements().removeIf(e -> e.getElementId().equals(elementId));
        }

        boardRepository.save(board);
        return message;
    }
}
