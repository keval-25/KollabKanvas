package com.kolab.kanvas.repository;

import com.kolab.kanvas.model.Summary;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SummaryRepository extends MongoRepository<Summary, String> {

    Optional<Summary> findFirstByBoardIdOrderByCreatedAtDesc(String boardId);
}
