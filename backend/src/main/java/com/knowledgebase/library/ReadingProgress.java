package com.knowledgebase.library;
import jakarta.persistence.*;
import java.io.Serializable;
import java.util.UUID;

@Entity
@Table(name="reading_progress")
public class ReadingProgress {
    @EmbeddedId private ReadingKey id;
    @Column(name="chapter_number",nullable=false) private int chapterNumber;
    @Column(nullable=false) private boolean completed;
    protected ReadingProgress(){}
    public ReadingProgress(UUID userId,String bookId,int chapter,boolean completed){
        id=new ReadingKey(userId,bookId);chapterNumber=chapter;this.completed=completed;
    }
    public String bookId(){return id.bookId;}
    public int chapterNumber(){return chapterNumber;}
    public boolean completed(){return completed;}
    @Embeddable
    public static class ReadingKey implements Serializable {
        @Column(name="user_id") private UUID userId;
        @Column(name="book_id",length=80) private String bookId;
        protected ReadingKey(){}
        public ReadingKey(UUID userId,String bookId){this.userId=userId;this.bookId=bookId;}
        @Override public boolean equals(Object other){return other instanceof ReadingKey key && userId.equals(key.userId) && bookId.equals(key.bookId);}
        @Override public int hashCode(){return java.util.Objects.hash(userId,bookId);}
    }
}
