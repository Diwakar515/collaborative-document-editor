package com.docs.websocket.dto;

public class NotificationMessageDTO {

    private Long id;

    private String message;

    private boolean read;

    private String createdAt;

    public Long getId() {
        return id;
    }

    public void setId(
            Long id
    ) {
        this.id = id;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(
            String message
    ) {
        this.message = message;
    }

    public boolean isRead() {
        return read;
    }

    public void setRead(
            boolean read
    ) {
        this.read = read;
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