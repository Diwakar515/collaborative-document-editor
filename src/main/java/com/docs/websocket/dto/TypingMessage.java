package com.docs.websocket.dto;

public class TypingMessage {

    private Long documentId;

    private String userEmail;

    private boolean typing;

    public TypingMessage() {
    }

    public TypingMessage(
            Long documentId,
            String userEmail,
            boolean typing
    ) {
        this.documentId = documentId;
        this.userEmail = userEmail;
        this.typing = typing;
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

    public boolean isTyping() {
        return typing;
    }

    public void setTyping(boolean typing) {
        this.typing = typing;
    }
}