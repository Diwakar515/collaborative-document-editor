package com.docs.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "documents",
        indexes = {
                @Index(
                        name = "idx_user_created",
                        columnList = "user_id, createdAt"
                ),
                @Index(
                        name = "idx_user_title",
                        columnList = "user_id, title"
                )
        }
)
public class Document {

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @OneToMany(
            mappedBy = "document",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<DocumentCollaborator> collaborators =
            new ArrayList<>();

    @OneToMany(
            mappedBy = "document",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<ActivityLog> activityLogs =
            new ArrayList<>();

    @OneToMany(
            mappedBy = "document",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<Comment> comments =
            new ArrayList<>();

    @OneToMany(
            mappedBy = "document",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<DocumentVersion> versions =
            new ArrayList<>();

    public Document() {
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public List<DocumentCollaborator> getCollaborators() {
        return collaborators;
    }

    public void setCollaborators(
            List<DocumentCollaborator> collaborators
    ) {
        this.collaborators = collaborators;
    }

    public List<ActivityLog> getActivityLogs() {
        return activityLogs;
    }

    public void setActivityLogs(
            List<ActivityLog> activityLogs
    ) {
        this.activityLogs = activityLogs;
    }

    public List<Comment> getComments() {
        return comments;
    }

    public void setComments(
            List<Comment> comments
    ) {
        this.comments = comments;
    }

    public List<DocumentVersion> getVersions() {
        return versions;
    }

    public void setVersions(
            List<DocumentVersion> versions
    ) {
        this.versions = versions;
    }
}