package com.kolab.kanvas.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "transcripts")
@CompoundIndex(name = "board_timestamp_idx", def = "{'boardId': 1, 'timestamp': -1}")
public class Transcript {

    @Id
    private String id;

    @Indexed
    private String boardId;

    private String userId;

    private String userName;

    private String actionType; // ELEMENT_CREATE, ELEMENT_UPDATE, ELEMENT_DELETE, COMMENT, ROLE_CHANGE, JOIN, LEAVE

    @Builder.Default
    private Map<String, Object> details = new HashMap<>();

    @CreatedDate
    @Indexed
    private Instant timestamp;
}
