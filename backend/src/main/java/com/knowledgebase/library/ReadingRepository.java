package com.knowledgebase.library;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface ReadingRepository extends JpaRepository<ReadingProgress,ReadingProgress.ReadingKey> {
    List<ReadingProgress> findByIdUserId(UUID userId);
}
