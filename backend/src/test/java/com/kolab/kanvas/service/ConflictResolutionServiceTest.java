package com.kolab.kanvas.service;

import com.kolab.kanvas.dto.ws.ElementOperationMessage;
import com.kolab.kanvas.model.Board;
import com.kolab.kanvas.model.BoardElement;
import com.kolab.kanvas.repository.BoardRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ConflictResolutionServiceTest {

    @Mock
    private BoardRepository boardRepository;

    @InjectMocks
    private ConflictResolutionService conflictResolutionService;

    private Board testBoard;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        testBoard = Board.builder()
                .id("b1")
                .name("Test Board")
                .elements(new ArrayList<>())
                .build();
    }

    @Test
    void testProcessElementCreate() {
        ElementOperationMessage msg = ElementOperationMessage.builder()
                .type("ELEMENT_CREATE")
                .op("CREATE")
                .boardId("b1")
                .elementId("el-1")
                .payload(Map.of("type", "rect", "x", 100, "y", 100, "width", 80, "height", 60))
                .userId("u1")
                .timestamp(System.currentTimeMillis())
                .build();

        when(boardRepository.findById("b1")).thenReturn(Optional.of(testBoard));
        when(boardRepository.save(any())).thenReturn(testBoard);

        ElementOperationMessage result = conflictResolutionService.processElementOperation(msg);

        assertNotNull(result);
        assertEquals(1, result.getClientVersion());
        assertEquals(1, testBoard.getElements().size());
        assertEquals("el-1", testBoard.getElements().get(0).getElementId());
    }

    @Test
    void testProcessElementUpdateVersionIncrement() {
        BoardElement existing = BoardElement.builder()
                .elementId("el-1")
                .type("rect")
                .props(new HashMap<>(Map.of("x", 100, "y", 100)))
                .version(1)
                .build();
        testBoard.getElements().add(existing);

        ElementOperationMessage updateMsg = ElementOperationMessage.builder()
                .type("ELEMENT_UPDATE")
                .op("UPDATE")
                .boardId("b1")
                .elementId("el-1")
                .payload(Map.of("x", 150, "y", 200))
                .clientVersion(1)
                .userId("u2")
                .timestamp(System.currentTimeMillis())
                .build();

        when(boardRepository.findById("b1")).thenReturn(Optional.of(testBoard));
        when(boardRepository.save(any())).thenReturn(testBoard);

        ElementOperationMessage result = conflictResolutionService.processElementOperation(updateMsg);

        assertNotNull(result);
        assertEquals(2, result.getClientVersion());
        assertEquals(2, existing.getVersion());
        assertEquals(150, existing.getProps().get("x"));
    }
}
