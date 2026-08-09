package com.docs.websocket.dto;

public class CommentMessageDTO {

    private Long documentId;
    private String content;
    private String userEmail;
    private String userName;
    private String createdAt;

    private Long commentId;
    private boolean resolved;
    private String type;

    public Long getDocumentId() {
        return documentId;
    }

    public void setDocumentId(
            Long documentId
    ) {
        this.documentId = documentId;
    }

    public Long getCommentId() {
        return commentId;
    }

    public void setCommentId(
            Long commentId
    ) {
        this.commentId = commentId;
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

    public String getUserName() {
        return userName;
    }

    public void setUserName(
            String userName
    ) {
        this.userName = userName;
    }

    public boolean isResolved() {
        return resolved;
    }

    public void setResolved(
            boolean resolved
    ) {
        this.resolved = resolved;
    }

    public String getType() {
        return type;
    }

    public void setType(
            String type
    ) {
        this.type = type;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(
            String createdAt
    ) {
        this.createdAt = createdAt;
    }
}