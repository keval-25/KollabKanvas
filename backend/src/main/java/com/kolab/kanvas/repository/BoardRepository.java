package com.kolab.kanvas.repository;

import com.kolab.kanvas.model.Board;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BoardRepository extends MongoRepository<Board, String> {

    @Query("{ '$or': [ { 'ownerId': ?0 }, { 'collaborators.userId': ?0 } ], 'isArchived': false }")
    List<Board> findActiveBoardsForUser(String userId);

    Optional<Board> findByIdAndIsArchivedFalse(String id);

    @Query("{ 'shareLink.token': ?0 }")
    Optional<Board> findByShareLinkToken(String token);
}
