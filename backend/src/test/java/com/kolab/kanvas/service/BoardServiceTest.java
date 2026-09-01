package com.kolab.kanvas.service;

import com.kolab.kanvas.dto.BoardDto;
import com.kolab.kanvas.dto.CreateBoardRequest;
import com.kolab.kanvas.model.Board;
import com.kolab.kanvas.model.User;
import com.kolab.kanvas.repository.BoardRepository;
import com.kolab.kanvas.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class BoardServiceTest {

    @Mock
    private BoardRepository boardRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private BoardService boardService;

    private User currentUser;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        currentUser = User.builder()
                .id("u1")
                .name("Alex")
                .email("alex@kanvas.app")
                .build();
    }

    @Test
    void testCreateBoard() {
        CreateBoardRequest req = CreateBoardRequest.builder()
                .name("Brainstorming Session")
                .template("blank")
                .build();

        Board savedBoard = Board.builder()
                .id("b1")
                .name("Brainstorming Session")
                .ownerId("u1")
                .build();

        when(boardRepository.save(any(Board.class))).thenReturn(savedBoard);

        BoardDto result = boardService.createBoard(currentUser, req);

        assertNotNull(result);
        assertEquals("b1", result.getId());
        assertEquals("Brainstorming Session", result.getName());
        assertEquals("OWNER", result.getRole());
    }

    @Test
    void testGetUserBoards() {
        Board b1 = Board.builder().id("b1").name("Board 1").ownerId("u1").build();
        when(boardRepository.findActiveBoardsForUser("u1")).thenReturn(List.of(b1));
        when(userRepository.findById("u1")).thenReturn(Optional.of(currentUser));

        List<BoardDto> boards = boardService.getUserBoards(currentUser);

        assertNotNull(boards);
        assertEquals(1, boards.size());
        assertEquals("Board 1", boards.get(0).getName());
    }
}
