package com.kolab.kanvas.security;

import com.kolab.kanvas.model.Board;
import com.kolab.kanvas.model.Collaborator;
import com.kolab.kanvas.repository.BoardRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketChannelInterceptor implements ChannelInterceptor {

    private final JwtTokenProvider jwtTokenProvider;
    private final BoardRepository boardRepository;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);

        if (StompCommand.SEND.equals(accessor.getCommand())) {
            String destination = accessor.getDestination();
            if (destination != null && destination.contains("/edit")) {
                // Extract boardId from destination /app/board/{boardId}/edit
                String[] parts = destination.split("/");
                if (parts.length >= 4) {
                    String boardId = parts[3];
                    String authHeader = accessor.getFirstNativeHeader("Authorization");

                    if (authHeader != null && authHeader.startsWith("Bearer ")) {
                        String token = authHeader.substring(7);
                        if (jwtTokenProvider.validateToken(token)) {
                            String userId = jwtTokenProvider.getUserIdFromToken(token);
                            Optional<Board> boardOpt = boardRepository.findById(boardId);
                            
                            if (boardOpt.isPresent()) {
                                Board board = boardOpt.get();
                                boolean isOwner = board.getOwnerId().equals(userId);
                                boolean isEditor = board.getCollaborators() != null &&
                                        board.getCollaborators().stream()
                                                .anyMatch(c -> c.getUserId().equals(userId) && ("EDITOR".equalsIgnoreCase(c.getRole()) || "OWNER".equalsIgnoreCase(c.getRole())));

                                if (!isOwner && !isEditor) {
                                    log.warn("Unauthorized WS edit attempt on board {} by user {}", boardId, userId);
                                    return null; // Reject frame server-side
                                }
                            }
                        }
                    }
                }
            }
        }

        return message;
    }
}
