package com.knowledgebase.library;
import jakarta.persistence.*;

@Entity
@Table(name = "book")
public class Book {
    @Id private String id;
    @Column(nullable=false, length=200) private String title;
    @Column(nullable=false, length=120) private String author;
    @Column(nullable=false, length=60) private String category;
    @Column(nullable=false, length=1000) private String description;
    @Column(nullable=false, length=20) private String color;
    @Column(name="source_url", nullable=false, length=500) private String sourceUrl;
    @Column(name="chapter_count", nullable=false) private int chapterCount;
    protected Book() {}
    public Book(String id, String title, String author, String category, String description, String color, String sourceUrl, int count) {
        this.id=id; this.title=title; this.author=author; this.category=category;
        this.description=description; this.color=color; this.sourceUrl=sourceUrl; this.chapterCount=count;
    }
    public String id(){return id;}
    public int chapterCount(){return chapterCount;}
    public BookView view(int chapter, boolean completed){return new BookView(id,title,author,category,description,color,sourceUrl,chapterCount,chapter,completed);}
    public record BookView(String id,String title,String author,String category,String description,String color,String sourceUrl,int chapterCount,int currentChapter,boolean completed){}
}
