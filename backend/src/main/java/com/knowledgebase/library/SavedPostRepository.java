package com.knowledgebase.library;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface SavedPostRepository extends JpaRepository<SavedPost,UUID>{
    List<SavedPost> findByUserIdOrderByCreatedAtDesc(UUID user);
    boolean existsByUserIdAndPostId(UUID user,String post);
    void deleteByUserIdAndPostId(UUID user,String post);
}
