package com.knowledgebase.library;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
@Entity @Table(name="saved_post")
public class SavedPost {
    @Id private UUID id;
    @Column(name="user_id",nullable=false) private UUID userId;
    @Column(name="post_id",nullable=false,length=80) private String postId;
    @Column(name="created_at",nullable=false) private Instant createdAt;
    protected SavedPost(){}
    public SavedPost(UUID user,String post){id=UUID.randomUUID();userId=user;postId=post;createdAt=Instant.now();}
    public String postId(){return postId;}
}
