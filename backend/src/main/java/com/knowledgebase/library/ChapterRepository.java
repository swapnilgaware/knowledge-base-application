package com.knowledgebase.library;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface ChapterRepository extends JpaRepository<BookChapter,UUID> {
    Optional<BookChapter> findByBookIdAndChapterNumber(String bookId,int chapterNumber);
    List<ChapterHeading> findByBookIdOrderByChapterNumberAsc(String bookId);
    interface ChapterHeading {
        int getChapterNumber();
        String getTitle();
    }
}
