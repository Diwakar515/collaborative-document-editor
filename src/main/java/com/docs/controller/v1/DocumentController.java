package com.docs.controller.v1;

import com.docs.dto.*;
import com.docs.model.Document;
import com.docs.service.DocumentService;

import jakarta.validation.Valid;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/documents")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    // CREATE
    @PostMapping
    public ApiResponse<DocumentResponseDTO> createDocument(
            @Valid @RequestBody DocumentRequestDTO request
    ) {
        String email = org.springframework.security.core.context.SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        Document document = documentService.createDocumentByEmail(
                email,
                request.getTitle(),
                request.getContent()
        );

        // Convert to DTO
        DocumentResponseDTO dto = new DocumentResponseDTO();
        dto.setId(document.getId());
        dto.setTitle(document.getTitle());
        dto.setContent(document.getContent());
        dto.setCreatedAt(document.getCreatedAt());
        dto.setOwnerEmail(document.getUser().getEmail());

        ApiResponse<DocumentResponseDTO> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage("Document created successfully");
        response.setData(dto);

        return response;
    }

    @GetMapping("/{id}")
    public ApiResponse<DocumentResponseDTO> getDocumentById(
            @PathVariable Long id
    ) {

        String email =
                org.springframework.security
                        .core.context.SecurityContextHolder
                        .getContext()
                        .getAuthentication()
                        .getName();

        DocumentResponseDTO document =
                documentService.getDocumentById(
                        id,
                        email
                );

        ApiResponse<DocumentResponseDTO>
                response =
                new ApiResponse<>();

        response.setSuccess(true);

        response.setMessage(
                "Document fetched successfully"
        );

        response.setData(document);

        return response;
    }

    // READ (PAGINATED)
    @GetMapping
    public ApiResponse<PaginatedResponse<DocumentResponseDTO>> getUserDocuments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(required = false) String search
    ) {

        String email = org.springframework.security.core.context.SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        PaginatedResponse<DocumentResponseDTO> documents =
                documentService.getDocumentsByEmailPaginated(email, page, size, search);

        ApiResponse<PaginatedResponse<DocumentResponseDTO>> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage("Documents fetched successfully");
        response.setData(documents);

        return response;
    }

    // UPDATE
    @PutMapping("/{id}")
    public ApiResponse<DocumentResponseDTO> updateDocument(
            @PathVariable Long id,
            @Valid @RequestBody DocumentRequestDTO request
    ) {
        String email = SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        DocumentResponseDTO updated =
                documentService.updateDocument(
                        id,
                        email,
                        request.getTitle(),
                        request.getContent()
                );

        ApiResponse<DocumentResponseDTO> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage("Document updated successfully");
        response.setData(updated);

        return response;
    }

    @PutMapping("/{id}/autosave")
    public ApiResponse<DocumentResponseDTO> autoSaveDocument(

            @PathVariable Long id,

            @Valid
            @RequestBody
            DocumentRequestDTO request
    ) {

        String email =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication()
                        .getName();

        DocumentResponseDTO dto =
                documentService
                        .autoSaveDocument(
                                id,
                                email,
                                request.getTitle(),
                                request.getContent()
                        );

        ApiResponse<DocumentResponseDTO>
                response =
                new ApiResponse<>();

        response.setSuccess(true);

        response.setMessage(
                "Document autosaved"
        );

        response.setData(dto);

        return response;
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ApiResponse<Object> deleteDocument(@PathVariable Long id) {

        String email = org.springframework.security.core.context.SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getName();

        documentService.deleteDocument(id, email);

        ApiResponse<Object> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage("Document deleted successfully");
        response.setData(null);

        return response;
    }

    //SHARE
    @PostMapping("/{id}/share")
    public ApiResponse<Object> shareDocument(
            @PathVariable Long id,
            @Valid
            @RequestBody
            ShareDocumentRequest request
    ) {

        String email =
                org.springframework.security
                        .core.context.SecurityContextHolder
                        .getContext()
                        .getAuthentication()
                        .getName();

        documentService.shareDocument(
                id,
                email,
                request.getCollaboratorEmail(),
                request.getPermissionType()
        );

        ApiResponse<Object> response =
                new ApiResponse<>();

        response.setSuccess(true);

        response.setMessage(
                "Document shared successfully"
        );

        response.setData(null);

        return response;
    }

    @DeleteMapping(
            "/{id}/collaborators/{collaboratorEmail}"
    )
    public ApiResponse<Object> removeCollaborator(

            @PathVariable Long id,

            @PathVariable
            String collaboratorEmail
    ) {

        String ownerEmail =

                org.springframework.security
                        .core.context.SecurityContextHolder
                        .getContext()
                        .getAuthentication()
                        .getName();

        documentService.removeCollaborator(

                id,

                ownerEmail,

                collaboratorEmail
        );

        ApiResponse<Object>
                response =

                new ApiResponse<>();

        response.setSuccess(
                true
        );

        response.setMessage(
                "Collaborator removed successfully"
        );

        response.setData(
                null
        );

        return response;
    }

    @PatchMapping(
            "/{id}/collaborators/permissions"
    )
    public ApiResponse<Object> updateCollaboratorPermission(

            @PathVariable Long id,

            @Valid
            @RequestBody
            ShareDocumentRequest request
    ) {

        String ownerEmail =

                org.springframework.security
                        .core.context
                        .SecurityContextHolder

                        .getContext()
                        .getAuthentication()
                        .getName();

        documentService
                .updateCollaboratorPermission(

                        id,

                        ownerEmail,

                        request
                                .getCollaboratorEmail(),

                        request
                                .getPermissionType()
                );

        ApiResponse<Object> response =
                new ApiResponse<>();

        response.setSuccess(true);

        response.setMessage(
                "Collaborator permission updated successfully"
        );

        response.setData(null);

        return response;
    }

    @GetMapping(
            "/{id}/collaborators"
    )
    public ApiResponse<List<CollaboratorResponseDTO>> getCollaborators(

            @PathVariable Long id
    ) {

        String userEmail =

                org.springframework.security
                        .core.context
                        .SecurityContextHolder

                        .getContext()
                        .getAuthentication()
                        .getName();

        List<CollaboratorResponseDTO>
                collaborators =

                documentService
                        .getCollaborators(

                                id,

                                userEmail
                        );

        ApiResponse<
                List<CollaboratorResponseDTO>
                > response =

                new ApiResponse<>();

        response.setSuccess(true);

        response.setMessage(
                "Collaborators fetched successfully"
        );

        response.setData(collaborators);

        return response;
    }

    @GetMapping("/{id}/versions")
    public ApiResponse<List<DocumentVersionResponseDTO>> getVersions(
            @PathVariable Long id
    ) {

        List<DocumentVersionResponseDTO>
                versions =
                documentService
                        .getVersions(id);

        ApiResponse<
                List<
                        DocumentVersionResponseDTO
                        >
                > response =
                new ApiResponse<>();

        response.setSuccess(true);
        response.setMessage(
                "Document versions fetched successfully"
        );

        response.setData(versions);

        return response;
    }

    @GetMapping("/{id}/activities")
    public ApiResponse<List<ActivityLogResponseDTO>> getActivities(
            @PathVariable Long id
    ) {

        List<ActivityLogResponseDTO>
                logs =
                documentService
                        .getActivityLogs(id);

        ApiResponse<
                List<
                        ActivityLogResponseDTO
                        >
                > response =
                new ApiResponse<>();

        response.setSuccess(true);

        response.setMessage(
                "Activity logs fetched successfully"
        );

        response.setData(logs);

        return response;
    }

    @PostMapping("/{id}/comments")
    public ApiResponse<CommentResponseDTO> addComment(
            @PathVariable Long id,
            @Valid
            @RequestBody
            CommentRequestDTO request
    ) {

        String email =
                org.springframework.security
                        .core.context.SecurityContextHolder
                        .getContext()
                        .getAuthentication()
                        .getName();

        CommentResponseDTO comment =
                documentService.addComment(
                        id,
                        email,
                        request
                );

        ApiResponse<CommentResponseDTO>
                response =
                new ApiResponse<>();

        response.setSuccess(true);

        response.setMessage(
                "Comment added successfully"
        );

        response.setData(comment);

        return response;
    }

    @GetMapping("/{id}/comments")
    public ApiResponse<List<CommentResponseDTO>> getComments(
            @PathVariable Long id
    ) {

        String email =
                org.springframework.security
                        .core.context.SecurityContextHolder
                        .getContext()
                        .getAuthentication()
                        .getName();

        List<CommentResponseDTO>
                comments =
                documentService.getComments(
                        id,
                        email
                );

        ApiResponse<
                List<CommentResponseDTO>
                > response =
                new ApiResponse<>();

        response.setSuccess(true);

        response.setMessage(
                "Comments fetched successfully"
        );

        response.setData(comments);

        return response;
    }

    @PatchMapping(
            "/{documentId}/comments/{commentId}/resolve"
    )
    public ApiResponse<CommentResponseDTO> resolveComment(
            @PathVariable Long documentId,
            @PathVariable Long commentId
    ) {

        String email =
                org.springframework.security
                        .core.context.SecurityContextHolder
                        .getContext()
                        .getAuthentication()
                        .getName();

        CommentResponseDTO resolvedComment =
                documentService.resolveComment(
                        documentId,
                        commentId,
                        email
                );

        ApiResponse<CommentResponseDTO>
                response =
                new ApiResponse<>();

        response.setSuccess(true);

        response.setMessage(
                "Comment resolved successfully"
        );

        response.setData(
                resolvedComment
        );

        return response;
    }
}