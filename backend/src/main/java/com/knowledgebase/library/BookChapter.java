package com.knowledgebase.library;
import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name="book_chapter")
public class BookChapter {
    @Id private UUID id;
    @Column(name="book_id",nullable=false,length=80) private String bookId;
    @Column(name="chapter_number",nullable=false) private int chapterNumber;
    @Column(nullable=false,length=200) private String title;
    @Column(nullable=false,columnDefinition="text") private String content;
    protected BookChapter(){}
    public BookChapter(String bookId,int number,String title,String content){
        id=UUID.randomUUID();this.bookId=bookId;chapterNumber=number;this.title=title;this.content=content;
    }
    public ChapterView view(){return new ChapterView(chapterNumber,title,content);}
    public record ChapterView(int chapterNumber,String title,String content){}
}
