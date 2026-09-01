package com.kolab.kanvas.controller;

import com.kolab.kanvas.dto.BoardDto;
import com.kolab.kanvas.dto.CreateBoardRequest;
import com.kolab.kanvas.dto.UpdateBoardRequest;
import com.kolab.kanvas.model.User;
import com.kolab.kanvas.service.BoardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/boards")
@RequiredArgsConstructor
public class BoardController {

    private final BoardService boardService;

    @PostMapping
    public ResponseEntity<BoardDto> createBoard(@AuthenticationPrincipal User currentUser,
                                                @Valid @RequestBody CreateBoardRequest request) {
        return ResponseEntity.ok(boardService.createBoard(currentUser, request));
    }

    @GetMapping
    public ResponseEntity<List<BoardDto>> getUserBoards(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(boardService.getUserBoards(currentUser));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BoardDto> getBoardById(@AuthenticationPrincipal User currentUser,
                                                 @PathVariable("id") String boardId) {
        return ResponseEntity.ok(boardService.getBoardById(currentUser, boardId));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<BoardDto> updateBoard(@AuthenticationPrincipal User currentUser,
                                                @PathVariable("id") String boardId,
                                                @RequestBody UpdateBoardRequest request) {
        return ResponseEntity.ok(boardService.updateBoard(currentUser, boardId, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBoard(@AuthenticationPrincipal User currentUser,
                                            @PathVariable("id") String boardId) {
        boardService.deleteBoard(currentUser, boardId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/duplicate")
    public ResponseEntity<BoardDto> duplicateBoard(@AuthenticationPrincipal User currentUser,
                                                   @PathVariable("id") String boardId) {
        return ResponseEntity.ok(boardService.duplicateBoard(currentUser, boardId));
    }

    @PostMapping("/{id}/collaborators")
    public ResponseEntity<BoardDto> inviteCollaborator(@AuthenticationPrincipal User currentUser,
                                                       @PathVariable("id") String boardId,
                                                       @Valid @RequestBody com.kolab.kanvas.dto.InviteCollaboratorRequest request) {
        return ResponseEntity.ok(boardService.inviteCollaborator(currentUser, boardId, request));
    }

    @PatchMapping("/{id}/collaborators/{userId}")
    public ResponseEntity<BoardDto> updateCollaboratorRole(@AuthenticationPrincipal User currentUser,
                                                           @PathVariable("id") String boardId,
                                                           @PathVariable("userId") String targetUserId,
                                                           @Valid @RequestBody com.kolab.kanvas.dto.UpdateRoleRequest request) {
        return ResponseEntity.ok(boardService.updateCollaboratorRole(currentUser, boardId, targetUserId, request));
    }

    @DeleteMapping("/{id}/collaborators/{userId}")
    public ResponseEntity<Void> revokeCollaborator(@AuthenticationPrincipal User currentUser,
                                                   @PathVariable("id") String boardId,
                                                   @PathVariable("userId") String targetUserId) {
        boardService.revokeCollaborator(currentUser, boardId, targetUserId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/share-link")
    public ResponseEntity<com.kolab.kanvas.model.ShareLink> generateShareLink(@AuthenticationPrincipal User currentUser,
                                                                             @PathVariable("id") String boardId,
                                                                             @RequestParam(value = "defaultRole", defaultValue = "VIEWER") String defaultRole) {
        return ResponseEntity.ok(boardService.generateShareLink(currentUser, boardId, defaultRole));
    }
}
