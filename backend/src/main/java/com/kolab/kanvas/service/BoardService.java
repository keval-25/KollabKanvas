package com.kolab.kanvas.service;

import com.kolab.kanvas.dto.BoardDto;
import com.kolab.kanvas.dto.CreateBoardRequest;
import com.kolab.kanvas.dto.UpdateBoardRequest;
import com.kolab.kanvas.model.Board;
import com.kolab.kanvas.model.BoardElement;
import com.kolab.kanvas.model.Collaborator;
import com.kolab.kanvas.model.User;
import com.kolab.kanvas.repository.BoardRepository;
import com.kolab.kanvas.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BoardService {

    private final BoardRepository boardRepository;
    private final UserRepository userRepository;

    public BoardDto createBoard(User currentUser, CreateBoardRequest request) {
        Board board = Board.builder()
                .name(request.getName().trim())
                .ownerId(currentUser.getId())
                .collaborators(List.of(Collaborator.builder()
                        .userId(currentUser.getId())
                        .role("OWNER")
                        .addedAt(Instant.now())
                        .build()))
                .elements(createInitialTemplateElements(request.getTemplate(), currentUser.getId()))
                .isArchived(false)
                .build();

        Board saved = boardRepository.save(board);
        return BoardDto.fromEntity(saved, currentUser.getId(), currentUser.getName());
    }

    public List<BoardDto> getUserBoards(User currentUser) {
        List<Board> boards = boardRepository.findActiveBoardsForUser(currentUser.getId());
        return boards.stream().map(b -> {
            String ownerName = userRepository.findById(b.getOwnerId())
                    .map(User::getName)
                    .orElse("Unknown");
            return BoardDto.fromEntity(b, currentUser.getId(), ownerName);
        }).collect(Collectors.toList());
    }

    public BoardDto getBoardById(User currentUser, String boardId) {
        Board board = boardRepository.findByIdAndIsArchivedFalse(boardId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Board not found"));

        verifyUserAccess(currentUser.getId(), board);

        String ownerName = userRepository.findById(board.getOwnerId())
                .map(User::getName)
                .orElse("Unknown");

        return BoardDto.fromEntity(board, currentUser.getId(), ownerName);
    }

    public BoardDto updateBoard(User currentUser, String boardId, UpdateBoardRequest request) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Board not found"));

        verifyUserAccess(currentUser.getId(), board);

        if (request.getName() != null && !request.getName().isBlank()) {
            verifyOwnerAccess(currentUser.getId(), board);
            board.setName(request.getName().trim());
        }
        if (request.getIsArchived() != null) {
            verifyOwnerAccess(currentUser.getId(), board);
            board.setArchived(request.getIsArchived());
        }
        if (request.getElements() != null) {
            board.setElements(request.getElements());
        }

        Board updated = boardRepository.save(board);
        return BoardDto.fromEntity(updated, currentUser.getId(), currentUser.getName());
    }

    public void deleteBoard(User currentUser, String boardId) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Board not found"));

        verifyOwnerAccess(currentUser.getId(), board);
        boardRepository.delete(board);
    }

    public BoardDto duplicateBoard(User currentUser, String boardId) {
        Board source = boardRepository.findById(boardId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Board not found"));

        verifyUserAccess(currentUser.getId(), source);

        Board copy = Board.builder()
                .name(source.getName() + " (Copy)")
                .ownerId(currentUser.getId())
                .collaborators(List.of(Collaborator.builder()
                        .userId(currentUser.getId())
                        .role("OWNER")
                        .addedAt(Instant.now())
                        .build()))
                .elements(new ArrayList<>(source.getElements()))
                .isArchived(false)
                .build();

        Board saved = boardRepository.save(copy);
        return BoardDto.fromEntity(saved, currentUser.getId(), currentUser.getName());
    }

    public BoardDto inviteCollaborator(User currentUser, String boardId, com.kolab.kanvas.dto.InviteCollaboratorRequest request) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Board not found"));
        verifyOwnerAccess(currentUser.getId(), board);

        User invitee = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found with email: " + request.getEmail()));

        if (board.getCollaborators() == null) {
            board.setCollaborators(new ArrayList<>());
        }

        // Check if already a collaborator
        board.getCollaborators().removeIf(c -> c.getUserId().equals(invitee.getId()));
        board.getCollaborators().add(Collaborator.builder()
                .userId(invitee.getId())
                .role(request.getRole().toUpperCase())
                .addedAt(Instant.now())
                .build());

        Board saved = boardRepository.save(board);
        return BoardDto.fromEntity(saved, currentUser.getId(), currentUser.getName());
    }

    public BoardDto updateCollaboratorRole(User currentUser, String boardId, String targetUserId, com.kolab.kanvas.dto.UpdateRoleRequest request) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Board not found"));
        verifyOwnerAccess(currentUser.getId(), board);

        if (board.getCollaborators() != null) {
            board.getCollaborators().stream()
                    .filter(c -> c.getUserId().equals(targetUserId))
                    .findFirst()
                    .ifPresent(c -> c.setRole(request.getRole().toUpperCase()));
        }

        Board saved = boardRepository.save(board);
        return BoardDto.fromEntity(saved, currentUser.getId(), currentUser.getName());
    }

    public void revokeCollaborator(User currentUser, String boardId, String targetUserId) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Board not found"));
        verifyOwnerAccess(currentUser.getId(), board);

        if (board.getCollaborators() != null) {
            board.getCollaborators().removeIf(c -> c.getUserId().equals(targetUserId));
        }
        boardRepository.save(board);
    }

    public com.kolab.kanvas.model.ShareLink generateShareLink(User currentUser, String boardId, String defaultRole) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Board not found"));
        verifyOwnerAccess(currentUser.getId(), board);

        String token = UUID.randomUUID().toString().replace("-", "");
        com.kolab.kanvas.model.ShareLink shareLink = com.kolab.kanvas.model.ShareLink.builder()
                .token(token)
                .defaultRole(defaultRole != null ? defaultRole.toUpperCase() : "VIEWER")
                .expiresAt(Instant.now().plusSeconds(86400 * 30)) // 30 days
                .build();

        board.setShareLink(shareLink);
        boardRepository.save(board);
        return shareLink;
    }

    public void verifyUserAccess(String userId, Board board) {
        boolean isOwner = board.getOwnerId().equals(userId);
        boolean isCollaborator = board.getCollaborators() != null &&
                board.getCollaborators().stream().anyMatch(c -> c.getUserId().equals(userId));

        if (!isOwner && !isCollaborator) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to this board");
        }
    }

    public void verifyOwnerAccess(String userId, Board board) {
        if (!board.getOwnerId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only board owner can perform this action");
        }
    }

    private List<BoardElement> createInitialTemplateElements(String template, String userId) {
        List<BoardElement> list = new ArrayList<>();
        if ("mindmap".equalsIgnoreCase(template)) {
            list.add(BoardElement.builder()
                    .elementId(UUID.randomUUID().toString())
                    .type("sticky")
                    .props(Map.of("x", 400, "y", 300, "width", 200, "height", 150, "text", "Central Topic", "fillColor", "#fef08a"))
                    .zIndex(1)
                    .version(1)
                    .lastEditedBy(userId)
                    .lastEditedAt(Instant.now())
                    .build());
        } else if ("flowchart".equalsIgnoreCase(template)) {
            list.add(BoardElement.builder()
                    .elementId(UUID.randomUUID().toString())
                    .type("rect")
                    .props(Map.of("x", 200, "y", 150, "width", 160, "height", 80, "text", "Start Process", "fillColor", "#bbf7d0", "strokeColor", "#166534"))
                    .zIndex(1)
                    .version(1)
                    .lastEditedBy(userId)
                    .lastEditedAt(Instant.now())
                    .build());
        }
        return list;
    }
}
