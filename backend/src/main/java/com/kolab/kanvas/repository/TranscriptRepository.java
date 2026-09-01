package com.kolab.kanvas.repository;

import com.kolab.kanvas.model.Transcript;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TranscriptRepository extends MongoRepository<Transcript, String> {

    List<Transcript> findByBoardIdOrderByTimestampDesc(String boardId);

    List<Transcript> findByBoardIdAndUserIdOrderByTimestampDesc(String boardId, String userId);

    List<Transcript> findByBoardIdAndActionTypeOrderByTimestampDesc(String boardId, String actionType);
}
