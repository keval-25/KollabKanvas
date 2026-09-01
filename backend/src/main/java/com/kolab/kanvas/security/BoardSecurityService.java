package com.kolab.kanvas.security;

import com.kolab.kanvas.model.Board;
import com.kolab.kanvas.model.Collaborator;
import com.kolab.kanvas.model.User;
import com.kolab.kanvas.repository.BoardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Optional;

@Service("boardSecurity")
@RequiredArgsConstructor
public class BoardSecurityService {

    private final BoardRepository boardRepository;

    public boolean hasRole(User user, String boardId, String... allowedRoles) {
        if (user == null || boardId == null) return false;
        Optional<Board> boardOpt = boardRepository.findById(boardId);
        if (boardOpt.isEmpty()) return false;

        Board board = boardOpt.get();
        if (board.getOwnerId().equals(user.getId())) {
            return true; // Owner has all permissions
        }

        if (board.getCollaborators() == null) return false;

        return board.getCollaborators().stream()
                .filter(c -> c.getUserId().equals(user.getId()))
                .map(Collaborator::getRole)
                .anyMatch(role -> Arrays.asList(allowedRoles).contains(role));
    }

    public boolean canEdit(User user, String boardId) {
        return hasRole(user, boardId, "OWNER", "EDITOR");
    }

    public boolean canManageRoles(User user, String boardId) {
        return hasRole(user, boardId, "OWNER");
    }
}
