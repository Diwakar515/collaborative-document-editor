package com.docs.dto;

import lombok.Data;
import java.time.LocalDateTime;
import com.docs.model.PermissionType;

@Data
public class DocumentResponseDTO {

    private Long id;
    private String title;
    private String content;
    private LocalDateTime createdAt;

    private String ownerEmail; // only safe info
    private PermissionType permissionType;
}