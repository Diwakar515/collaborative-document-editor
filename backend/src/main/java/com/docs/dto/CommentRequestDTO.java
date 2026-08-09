package com.docs.dto;

import jakarta.validation.constraints.NotBlank;

public class CommentRequestDTO {

    @NotBlank(
            message = "Comment content is required"
    )
    private String content;

    public String getContent() {
        return content;
    }

    public void setContent(
            String content
    ) {
        this.content = content;
    }
}