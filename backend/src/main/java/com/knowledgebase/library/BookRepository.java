package com.knowledgebase.library;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface BookRepository extends JpaRepository<Book,String> {
    List<Book> findAllByOrderByTitleAsc();
}
