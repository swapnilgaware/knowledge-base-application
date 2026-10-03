package com.knowledgebase.mindmap;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity @Table(name="mind_map")
public class MindMap {
    @Id private UUID id;
    @Column(name="user_id",nullable=false) private UUID userId;
    @Column(nullable=false,length=120) private String title;
    @Column(nullable=false,columnDefinition="text") private String nodes;
    @Version private long version;
    @Column(name="updated_at",nullable=false) private Instant updatedAt;
    protected MindMap(){}
    public MindMap(UUID user,String title,String nodes){id=UUID.randomUUID();userId=user;update(title,nodes);}
    public void update(String title,String nodes){this.title=title;this.nodes=nodes;updatedAt=Instant.now();}
    public UUID id(){return id;} public String title(){return title;} public String nodes(){return nodes;}
    public long version(){return version;} public Instant updatedAt(){return updatedAt;}
}
