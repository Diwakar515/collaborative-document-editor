package com.docs.dto;

import lombok.Data;

@Data
public class LoginResponseDTO {

    private String message;
    private Long userId;
    private String email;
    private String token;
}