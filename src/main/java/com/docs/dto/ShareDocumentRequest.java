package com.docs.dto;

import jakarta.validation.constraints.Email;

import jakarta.validation.constraints.NotBlank;
import com.docs.model.PermissionType;
import lombok.Data;

@Data
public class ShareDocumentRequest {

    @NotBlank
    @Email
    private String collaboratorEmail;
    private PermissionType permissionType;
}