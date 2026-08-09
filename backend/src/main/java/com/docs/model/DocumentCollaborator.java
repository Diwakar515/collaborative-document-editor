package com.docs.model;

import jakarta.persistence.*;

@Entity
@Table(
        name = "document_collaborators",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_document_collaborator",
                        columnNames = {
                                "document_id",
                                "collaborator_email"
                        }
                )
        }
)
public class DocumentCollaborator {

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;

    @Column(
            name = "collaborator_email",
            nullable = false
    )
    private String collaboratorEmail;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "document_id",
            nullable = false
    )
    private Document document;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PermissionType permissionType;

    public DocumentCollaborator() {
    }

    public Long getId() {
        return id;
    }

    public String getCollaboratorEmail() {
        return collaboratorEmail;
    }

    public void setCollaboratorEmail(
            String collaboratorEmail
    ) {
        this.collaboratorEmail =
                collaboratorEmail;
    }

    public Document getDocument() {
        return document;
    }

    public void setDocument(
            Document document
    ) {
        this.document = document;
    }

    public PermissionType getPermissionType() {
        return permissionType;
    }

    public void setPermissionType(
            PermissionType permissionType
    ) {
        this.permissionType =
                permissionType;
    }
}