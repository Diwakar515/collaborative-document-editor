package com.docs.websocket.dto;

public class DocumentSyncMessage {

    private Long documentId;

    private String content;

    public DocumentSyncMessage() {
    }

    public DocumentSyncMessage(
            Long documentId,
            String content
    ) {
        this.documentId = documentId;
        this.content = content;
    }

    public Long getDocumentId() {
        return documentId;
    }

    public void setDocumentId(Long documentId) {
        this.documentId = documentId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}