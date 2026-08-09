package com.docs.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "comments")
public class Comment {

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;

    @Column(
            columnDefinition = "TEXT",
            nullable = false
    )
    private String content;

    private String userEmail;

    private boolean resolved;

    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id")
    private Document document;

    public Comment() {

//        this.createdAt =
//                LocalDateTime.now();
//
//        this.resolved = false;
    }

    @PrePersist
    protected void onCreate() {

        createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public String getContent() {
        return content;
    }

    public void setContent(
            String content
    ) {
        this.content = content;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(
            String userEmail
    ) {
        this.userEmail = userEmail;
    }

    public boolean isResolved() {
        return resolved;
    }

    public void setResolved(
            boolean resolved
    ) {
        this.resolved = resolved;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public Document getDocument() {
        return document;
    }

    public void setDocument(
            Document document
    ) {
        this.document = document;
    }
}