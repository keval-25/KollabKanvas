package com.kolab.kanvas.dto;

import com.kolab.kanvas.model.Summary;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SummaryDto {

    private String id;
    private String boardId;
    private String generatedBy;
    private String content;
    private int sourceSnapshotVersion;
    private Instant createdAt;
    private boolean isCached;

    public static SummaryDto fromEntity(Summary summary, boolean isCached) {
        if (summary == null) return null;
        return SummaryDto.builder()
                .id(summary.getId())
                .boardId(summary.getBoardId())
                .generatedBy(summary.getGeneratedBy())
                .content(summary.getContent())
                .sourceSnapshotVersion(summary.getSourceSnapshotVersion())
                .createdAt(summary.getCreatedAt())
                .isCached(isCached)
                .build();
    }

    public Summary toEntity() {
        return Summary.builder()
                .id(id)
                .boardId(boardId)
                .generatedBy(generatedBy)
                .content(content)
                .sourceSnapshotVersion(sourceSnapshotVersion)
                .createdAt(createdAt != null ? createdAt : Instant.now())
                .build();
    }
}
