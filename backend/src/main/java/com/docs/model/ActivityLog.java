package com.docs.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "activity_logs")
public class ActivityLog {

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;

    private String action;

    private String userEmail;

    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id")
    private Document document;

    public ActivityLog() {
    }
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public String getAction() {
        return action;
    }

    public void setAction(
            String action
    ) {
        this.action = action;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(
            String userEmail
    ) {
        this.userEmail = userEmail;
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