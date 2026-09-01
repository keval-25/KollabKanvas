package com.kolab.kanvas.dto;

import com.kolab.kanvas.model.Board;
import com.kolab.kanvas.model.BoardElement;
import com.kolab.kanvas.model.Collaborator;
import com.kolab.kanvas.model.ShareLink;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BoardDto {

    private String id;
    private String name;
    private String ownerId;
    private String ownerName;
    private String role;
    private int elementsCount;
    private int collaboratorsCount;
    private boolean isArchived;
    private Instant createdAt;
    private Instant updatedAt;
    private List<BoardElement> elements;
    private List<Collaborator> collaborators;
    private ShareLink shareLink;

    public static BoardDto fromEntity(Board board, String currentUserId, String ownerName) {
        if (board == null) return null;

        String userRole = "VIEWER";
        if (board.getOwnerId() != null && board.getOwnerId().equals(currentUserId)) {
            userRole = "OWNER";
        } else if (board.getCollaborators() != null) {
            userRole = board.getCollaborators().stream()
                    .filter(c -> c.getUserId().equals(currentUserId))
                    .map(Collaborator::getRole)
                    .findFirst()
                    .orElse("VIEWER");
        }

        return BoardDto.builder()
                .id(board.getId())
                .name(board.getName())
                .ownerId(board.getOwnerId())
                .ownerName(ownerName != null ? ownerName : "Board Owner")
                .role(userRole)
                .elementsCount(board.getElements() != null ? board.getElements().size() : 0)
                .collaboratorsCount(board.getCollaborators() != null ? board.getCollaborators().size() : 0)
                .isArchived(board.isArchived())
                .createdAt(board.getCreatedAt())
                .updatedAt(board.getUpdatedAt())
                .elements(board.getElements())
                .collaborators(board.getCollaborators())
                .shareLink(board.getShareLink())
                .build();
    }
}
