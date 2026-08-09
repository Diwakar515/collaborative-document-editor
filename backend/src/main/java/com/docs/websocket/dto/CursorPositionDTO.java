package com.docs.websocket.dto;

public class CursorPositionDTO {

    private Long documentId;

    private String userEmail;

    private int position;

    public Long getDocumentId() {
        return documentId;
    }

    public void setDocumentId(
            Long documentId
    ) {
        this.documentId = documentId;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(
            String userEmail
    ) {
        this.userEmail = userEmail;
    }

    public int getPosition() {
        return position;
    }

    public void setPosition(
            int position
    ) {
        this.position = position;
    }
}
