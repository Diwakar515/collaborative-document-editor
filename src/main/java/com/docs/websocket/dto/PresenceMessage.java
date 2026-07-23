package com.docs.websocket.dto;

public class PresenceMessage {

    private Long documentId;

    private String userEmail;

    public PresenceMessage() {
    }

    public PresenceMessage(
            Long documentId,
            String userEmail
    ) {
        this.documentId = documentId;
        this.userEmail = userEmail;
    }

    public Long getDocumentId() {
        return documentId;
    }

    public void setDocumentId(Long documentId) {
        this.documentId = documentId;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }
}