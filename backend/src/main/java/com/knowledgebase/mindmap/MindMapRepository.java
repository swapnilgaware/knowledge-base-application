package com.knowledgebase.mindmap;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface MindMapRepository extends JpaRepository<MindMap,UUID>{
    List<MindMap> findByUserIdOrderByUpdatedAtDesc(UUID user);
    Optional<MindMap> findByIdAndUserId(UUID id,UUID user);
}
