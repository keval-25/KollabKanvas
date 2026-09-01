package com.kolab.kanvas.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "boards")
public class Board {

    @Id
    private String id;

    private String name;

    @Indexed
    private String ownerId;

    @Builder.Default
    private List<BoardElement> elements = new ArrayList<>();

    @Builder.Default
    private List<Collaborator> collaborators = new ArrayList<>();

    private ShareLink shareLink;

    @Builder.Default
    private boolean isArchived = false;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
