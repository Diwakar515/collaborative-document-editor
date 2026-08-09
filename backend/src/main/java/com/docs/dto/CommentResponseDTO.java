package com.docs.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CommentResponseDTO {

    private Long id;

    private String content;

    private String userEmail;

    private String userName;

    private boolean resolved;

    private LocalDateTime createdAt;
}