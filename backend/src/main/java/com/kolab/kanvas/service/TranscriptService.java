package com.kolab.kanvas.service;

import com.kolab.kanvas.model.Board;
import com.kolab.kanvas.model.Transcript;
import com.kolab.kanvas.model.User;
import com.kolab.kanvas.repository.BoardRepository;
import com.kolab.kanvas.repository.TranscriptRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TranscriptService {

    private final TranscriptRepository transcriptRepository;
    private final BoardRepository boardRepository;
    private final BoardService boardService;

    public void logAction(String boardId, String userId, String userName, String actionType, Map<String, Object> details) {
        Transcript transcript = Transcript.builder()
                .boardId(boardId)
                .userId(userId)
                .userName(userName != null ? userName : "User")
                .actionType(actionType)
                .details(details != null ? details : Map.of())
                .timestamp(Instant.now())
                .build();

        transcriptRepository.save(transcript);
    }

    public List<Transcript> getTranscripts(User currentUser, String boardId, String userIdFilter, String actionTypeFilter) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Board not found"));

        boardService.verifyUserAccess(currentUser.getId(), board);

        List<Transcript> list;
        if (userIdFilter != null && !userIdFilter.isBlank()) {
            list = transcriptRepository.findByBoardIdAndUserIdOrderByTimestampDesc(boardId, userIdFilter);
        } else if (actionTypeFilter != null && !actionTypeFilter.isBlank()) {
            list = transcriptRepository.findByBoardIdAndActionTypeOrderByTimestampDesc(boardId, actionTypeFilter);
        } else {
            list = transcriptRepository.findByBoardIdOrderByTimestampDesc(boardId);
        }

        return list;
    }

    public String exportTranscriptCsv(User currentUser, String boardId) {
        List<Transcript> transcripts = getTranscripts(currentUser, boardId, null, null);

        StringBuilder csv = new StringBuilder();
        csv.append("Timestamp,User ID,User Name,Action Type,Details\n");

        for (Transcript t : transcripts) {
            csv.append(String.format("\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"\n",
                    t.getTimestamp() != null ? t.getTimestamp().toString() : "",
                    t.getUserId() != null ? t.getUserId() : "",
                    t.getUserName() != null ? t.getUserName().replace("\"", "\"\"") : "",
                    t.getActionType() != null ? t.getActionType() : "",
                    t.getDetails() != null ? t.getDetails().toString().replace("\"", "\"\"") : ""
            ));
        }

        return csv.toString();
    }
}
