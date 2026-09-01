package com.kolab.kanvas.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Collaborator {

    private String userId;
    private String role; // OWNER, EDITOR, COMMENTER, VIEWER
    @Builder.Default
    private Instant addedAt = Instant.now();
}
