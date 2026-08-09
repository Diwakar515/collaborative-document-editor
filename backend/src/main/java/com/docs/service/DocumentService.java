package com.docs.service;

import com.docs.dto.ActivityLogResponseDTO;
import com.docs.dto.DocumentResponseDTO;
import com.docs.dto.DocumentVersionResponseDTO;
import com.docs.dto.PaginatedResponse;
import com.docs.exception.ForbiddenException;
import com.docs.exception.ResourceNotFoundException;
import com.docs.model.Document;
import com.docs.model.User;
import com.docs.repository.DocumentRepository;
import com.docs.repository.UserRepository;
import com.docs.model.DocumentCollaborator;
import com.docs.repository.DocumentCollaboratorRepository;
import com.docs.model.DocumentVersion;
import com.docs.repository.DocumentVersionRepository;
import com.docs.model.ActivityLog;
import com.docs.repository.ActivityLogRepository;
import com.docs.model.PermissionType;
import com.docs.model.Comment;
import com.docs.repository.CommentRepository;
import com.docs.dto.CommentResponseDTO;
import com.docs.dto.CommentRequestDTO;
import com.docs.websocket.dto.CommentMessageDTO;
import com.docs.dto.CollaboratorResponseDTO;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.transaction.annotation.Transactional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class DocumentService {

    private static final Logger logger = LoggerFactory.getLogger(DocumentService.class);

    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final DocumentCollaboratorRepository documentCollaboratorRepository;
    private final DocumentVersionRepository documentVersionRepository;
    private final ActivityLogRepository activityLogRepository;
    private final CommentRepository commentRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationService notificationService;

    public DocumentService(DocumentRepository documentRepository,
                           UserRepository userRepository,
                           DocumentCollaboratorRepository documentCollaboratorRepository,
                           DocumentVersionRepository documentVersionRepository,
                           ActivityLogRepository activityLogRepository,
                           CommentRepository commentRepository,
                           SimpMessagingTemplate messagingTemplate,
                           NotificationService notificationService) {
        this.documentRepository = documentRepository;
        this.userRepository = userRepository;
        this.documentCollaboratorRepository = documentCollaboratorRepository;
        this.documentVersionRepository= documentVersionRepository;
        this.activityLogRepository = activityLogRepository;
        this.commentRepository = commentRepository;
        this.messagingTemplate = messagingTemplate;
        this.notificationService = notificationService;
    }

    private void logActivity(
            Document document,
            String action,
            String email
    ) {
        ActivityLog log = new ActivityLog();

        log.setDocument(document);
        log.setAction(action);
        log.setUserEmail(email);

        activityLogRepository.save(log);
    }

    @Transactional
    @CacheEvict(value = "documents", allEntries = true)
    public DocumentResponseDTO  createDocumentByEmail(String email, String title, String content) {

        logger.info("Creating document for user: {}", email);
        logger.debug("Document title: {}", title);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    logger.error("User not found while creating document: {}", email);
                    return new ResourceNotFoundException("User not found");
                });

        Document document = new Document();
        document.setTitle(title);
        document.setContent(content);
        document.setCreatedAt(LocalDateTime.now());
        document.setUser(user);

        Document saved = documentRepository.save(document);

        logger.info("Document created successfully with ID: {}", saved.getId());
        logActivity(
                saved,
                "Created document",
                email
        );

        return mapToDocumentDTO(saved);
    }

    public List<ActivityLogResponseDTO> getActivityLogs(
            Long documentId
    ) {

        Document document =
                documentRepository.findById(
                        documentId
                ).orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Document not found"
                        ));

        List<ActivityLog> logs =
                activityLogRepository
                        .findByDocumentOrderByCreatedAtDesc(
                                document
                        );

        return logs.stream()
                .map(log -> {

                    ActivityLogResponseDTO dto =
                            new ActivityLogResponseDTO();

                    dto.setId(log.getId());

                    dto.setAction(
                            log.getAction()
                    );

                    dto.setUserEmail(log.getUserEmail());

                    User user =

                            userRepository
                                    .findByEmail(
                                            log.getUserEmail()
                                    )
                                    .orElse(null);

                    dto.setUserName(

                            user != null

                                    ? user.getName()

                                    : log.getUserEmail()
                    );

                    dto.setCreatedAt(
                            log.getCreatedAt()
                    );

                    return dto;

                }).toList();
    }

    @Transactional
    @CacheEvict(
            value = "documents",
            allEntries = true
    )
    public void shareDocument(
            Long documentId,
            String ownerEmail,
            String collaboratorEmail,
            PermissionType permissionType
    ) {

        Document document = documentRepository.findById(documentId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Document not found"
                                ));

        if (
                !document.getUser()
                        .getEmail()
                        .equals(ownerEmail)
        ) {

            throw new ForbiddenException(
                    "Only owner can share document"
            );
        }

        if (collaboratorEmail.equals(ownerEmail))
        {
            throw new RuntimeException(
                    "Cannot share document with yourself"
            );
        }

        User collaboratorUser =

                userRepository
                        .findByEmail(
                                collaboratorEmail
                        )

                        .orElseThrow(() ->

                                new ResourceNotFoundException(
                                        "User does not exist"
                                )
                        );

        boolean alreadyExists = documentCollaboratorRepository
                        .existsByDocumentAndCollaboratorEmail(
                                document,
                                collaboratorEmail
                        );

        if (alreadyExists) {

            throw new RuntimeException(
                    "User already collaborator"
            );
        }

        DocumentCollaborator collaborator = new DocumentCollaborator();

        collaborator.setDocument(document);
        collaborator.setCollaboratorEmail(collaboratorEmail);
        collaborator.setPermissionType(
                permissionType != null ? permissionType : PermissionType.EDITOR
        );

        documentCollaboratorRepository.save(collaborator);

        User owner = userRepository
                        .findByEmail(ownerEmail)
                        .orElse(null);

        String ownerName = owner != null
                        ? owner.getName()
                        : ownerEmail;

        notificationService
                .createNotification(

                        collaboratorEmail,

                        ownerName +
                                " shared document '" +
                                document.getTitle() +
                                "' with you as " +
                                collaborator.getPermissionType()
                );

        logActivity(
                document,
                "Shared document with " +
                        collaboratorEmail,
                ownerEmail
        );
    }

    @Transactional
    @CacheEvict(
            value = "documents",
            allEntries = true
    )
    public void removeCollaborator(

            Long documentId,

            String ownerEmail,

            String collaboratorEmail
    ) {

        Document document =

                documentRepository
                        .findById(documentId)

                        .orElseThrow(() ->

                                new ResourceNotFoundException(
                                        "Document not found"
                                )
                        );

        if (

                !document.getUser()
                        .getEmail()
                        .equals(ownerEmail)

        ) {

            throw new ForbiddenException(
                    "Only owner can remove collaborators"
            );
        }

        DocumentCollaborator collaborator =

                documentCollaboratorRepository
                        .findByDocumentAndCollaboratorEmail(

                                document,

                                collaboratorEmail
                        )

                        .orElseThrow(() ->

                                new ResourceNotFoundException(
                                        "Collaborator not found"
                                )
                        );

        documentCollaboratorRepository
                .delete(collaborator);

        User owner = userRepository
                        .findByEmail(ownerEmail)
                        .orElse(null);

        String ownerName = owner != null
                        ? owner.getName()
                        : ownerEmail;
        notificationService.createNotification(
                        collaboratorEmail,
                        ownerName +
                                " removed your access to '" +
                                document.getTitle() +
                                "'"
                );

        logActivity(

                document,

                "Removed collaborator " +
                        collaboratorEmail,

                ownerEmail
        );
    }

    @Transactional
    @CacheEvict(
            value = "documents",
            allEntries = true
    )
    public void updateCollaboratorPermission(

            Long documentId,

            String ownerEmail,

            String collaboratorEmail,

            PermissionType permissionType
    ) {

        Document document =
                documentRepository.findById(
                        documentId
                ).orElseThrow(() ->

                        new ResourceNotFoundException(
                                "Document not found"
                        )
                );

        if (
                !document.getUser()
                        .getEmail()
                        .equals(ownerEmail)
        ) {

            throw new ForbiddenException(
                    "Only owner can update permissions"
            );
        }

        DocumentCollaborator collaborator =

                documentCollaboratorRepository
                        .findByDocumentAndCollaboratorEmail(

                                document,
                                collaboratorEmail
                        )

                        .orElseThrow(() ->

                                new ResourceNotFoundException(
                                        "Collaborator not found"
                                )
                        );

        PermissionType oldPermission = collaborator.getPermissionType();

        collaborator.setPermissionType(
                permissionType
        );

        documentCollaboratorRepository.save(collaborator);

        User owner =
                userRepository
                        .findByEmail(ownerEmail)
                        .orElse(null);

        String ownerName =

                owner != null

                        ? owner.getName()

                        : ownerEmail;

        notificationService.createNotification(
                        collaboratorEmail,
                        ownerName +
                                " changed your permission on '" +
                                document.getTitle() +
                                "' from " +
                                oldPermission +
                                " to " +
                                permissionType
                );

        logActivity(

                document,

                "Updated permission for " +
                        collaboratorEmail +
                        " to " +
                        permissionType,

                ownerEmail
        );
    }

    public List<CollaboratorResponseDTO> getCollaborators(

            Long documentId,

            String userEmail
    ) {

        Document document =
                documentRepository.findById(
                        documentId
                ).orElseThrow(() ->

                        new ResourceNotFoundException(
                                "Document not found"
                        )
                );

        boolean isOwner =

                document.getUser()
                        .getEmail()
                        .equals(userEmail);

        boolean isCollaborator =

                documentCollaboratorRepository
                        .existsByDocumentAndCollaboratorEmail(

                                document,
                                userEmail
                        );

        if (
                !isOwner &&
                        !isCollaborator
        ) {

            throw new ForbiddenException(
                    "Access denied"
            );
        }

        List<DocumentCollaborator>
                collaborators =

                documentCollaboratorRepository
                        .findAllByDocument(
                                document
                        );

        return collaborators.stream()

                .map(collaborator -> {

                    CollaboratorResponseDTO dto =
                            new CollaboratorResponseDTO();

                    dto.setCollaboratorEmail(
                            collaborator.getCollaboratorEmail()
                    );

                    User user =

                            userRepository
                                    .findByEmail(
                                            collaborator
                                                    .getCollaboratorEmail()
                                    )
                                    .orElse(null);

                    dto.setCollaboratorName(

                            user != null

                                    ? user.getName()

                                    : collaborator
                                    .getCollaboratorEmail()
                    );

                    dto.setPermissionType(

                            collaborator
                                    .getPermissionType()
                                    .name()
                    );

                    return dto;
                })

                .collect(Collectors.toList());
    }

    @Cacheable(
            value = "documents",
            key = "#email + '-' + #page + '-' + #size + '-' + #search"
    )
    public PaginatedResponse<DocumentResponseDTO> getDocumentsByEmailPaginated(
            String email,
            int page,
            int size,
            String search
    ) {

        logger.info("Fetching paginated documents for user: {}, page: {}, size: {}", email, page, size);

        if (search != null && !search.trim().isEmpty()) {
            logger.info("Search applied with keyword: {}", search);
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    logger.error("User not found while fetching paginated documents: {}", email);
                    return new ResourceNotFoundException("User not found");
                });

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by("createdAt").descending()
        );

        Page<Document> documentPage;

        if (search != null && !search.trim().isEmpty())
        {
            documentPage = documentRepository.searchAccessibleDocuments(
                                    user.getId(),
                                    email,
                                    search,
                                    pageable
                            );

        } else {

            documentPage = documentRepository.findAccessibleDocuments(
                                    user.getId(),
                                    email,
                                    pageable
                            );
        }

        List<Document> documents = documentPage.getContent();

        List<DocumentResponseDTO> dtoList =
                documents.stream().map(doc -> {

                    DocumentResponseDTO dto =
                            new DocumentResponseDTO();

                    dto.setId(doc.getId());

                    dto.setTitle(doc.getTitle());

                    dto.setContent(doc.getContent());

                    dto.setCreatedAt(doc.getCreatedAt());

                    dto.setOwnerEmail(
                            doc.getUser().getEmail()
                    );

                    boolean isOwner =
                            doc.getUser()
                                    .getEmail()
                                    .equals(email);

                    if (isOwner) {

                        dto.setPermissionType(
                                PermissionType.OWNER
                        );

                    } else {

                        Optional<DocumentCollaborator>
                                collaboratorOptional =
                                documentCollaboratorRepository
                                        .findByDocumentAndCollaboratorEmail(
                                                doc,
                                                email
                                        );

                        collaboratorOptional.ifPresent(
                                collaborator ->
                                        dto.setPermissionType(
                                                collaborator
                                                        .getPermissionType()
                                        )
                        );
                    }

                    return dto;

                }).collect(Collectors.toList());

        PaginatedResponse<DocumentResponseDTO> response = new PaginatedResponse<>();

        response.setItems(dtoList);
        response.setPage(documentPage.getNumber());
        response.setSize(documentPage.getSize());
        response.setTotalElements(documentPage.getTotalElements());
        response.setTotalPages(documentPage.getTotalPages());

        return response;
    }

    public DocumentResponseDTO getDocumentById(
            Long documentId,
            String email
    ) {

        Document document =
                documentRepository
                        .findById(documentId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Document not found"
                                ));

        Optional<DocumentCollaborator> collaborator =
                getCollaborator(document, email);

        if (!canRead(document, email)) {

            logger.warn(
                    "Unauthorized access attempt by user: {} on document ID: {}",
                    email,
                    documentId
            );

            throw new ForbiddenException(
                    "You do not have permission to access this document"
            );
        }

        DocumentResponseDTO dto = mapToDocumentDTO(document);

        if (isOwner(document, email)) {
            dto.setPermissionType(PermissionType.OWNER);
        } else {
            dto.setPermissionType(
                    collaborator.get().getPermissionType());
        }

        return dto;
    }

    @Transactional
    @CacheEvict(value = "documents", allEntries = true)
    public DocumentResponseDTO updateDocument(
            Long documentId,
            String email,
            String title,
            String content
    ) {

        logger.info(
                "Updating document with ID: {}",
                documentId
        );

        Document document = documentRepository.findById(documentId)
                        .orElseThrow(() -> {

                            logger.error(
                                    "Document not found with ID: {}",
                                    documentId
                            );

                            return new ResourceNotFoundException(
                                    "Document not found"
                            );
                        });

        if (!canEdit(document, email)) {

            logger.warn(
                    "Unauthorized update attempt by user: {} on document ID: {}",
                    email,
                    documentId
            );

            throw new ForbiddenException(
                    "You do not have permission to edit this document"
            );
        }

        logger.debug(
                "Updating document title to: {}",
                title
        );

        DocumentVersion version = new DocumentVersion();
        version.setDocument(document);
        version.setTitle(
                document.getTitle()
        );
        version.setContent(
                document.getContent()
        );
        documentVersionRepository.save(version);

        document.setTitle(title);
        document.setContent(content);
        Document updated = documentRepository.save(document);

        logger.info(
                "Document updated successfully with ID: {}",
                documentId
        );

        logActivity(
                updated,
                "Updated document",
                email
        );

        return mapToDocumentDTO(updated);
    }

    @Transactional
    @CacheEvict(
            value = "documents",
            allEntries = true
    )
    public DocumentResponseDTO autoSaveDocument(
            Long documentId,
            String email,
            String title,
            String content
    ) {

        logger.info(
                "Updating document with ID: {}",
                documentId
        );

        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> {

                    logger.error(
                            "Document not found with ID: {}",
                            documentId
                    );

                    return new ResourceNotFoundException(
                            "Document not found"
                    );
                });

        if (!canEdit(document, email)) {

            logger.warn(
                    "Unauthorized auto-save attempt by user: {} on document ID: {}",
                    email,
                    documentId
            );

            throw new ForbiddenException(
                    "You do not have permission to edit this document"
            );
        }

        logger.debug(
                "Updating document title to: {}",
                title
        );

        document.setTitle(title);
        document.setContent(content);
        Document updated = documentRepository.save(document);

        logger.info(
                "Document updated successfully with ID: {}",
                documentId
        );

        logActivity(
                updated,
                "Updated document",
                email
        );

        return mapToDocumentDTO(updated);
    }

    @Transactional
    @CacheEvict(value = "documents", allEntries = true)
    public void deleteDocument(Long documentId, String email) {

        logger.info("Deleting document with ID: {}", documentId);

        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> {
                    logger.error("Document not found with ID: {}", documentId);
                    return new ResourceNotFoundException("Document not found");
                });

        if (!document.getUser().getEmail().equals(email)) {
            logger.warn("Unauthorized delete attempt by user: {} on document ID: {}", email, documentId);
            throw new ForbiddenException("You are not allowed to delete this document");
        }

        documentRepository.delete(document);

        logger.info("Document deleted successfully with ID: {}", documentId);
    }

    public List<DocumentVersionResponseDTO> getVersions(Long documentId) {
        Document document =
                documentRepository.findById(
                        documentId
                ).orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Document not found"
                        ));

        List<DocumentVersion>
                versions =
                documentVersionRepository
                        .findByDocumentOrderByCreatedAtDesc(
                                document


                        );

        return versions.stream()
                .map(version -> {

                    DocumentVersionResponseDTO dto = new DocumentVersionResponseDTO();

                    dto.setId(version.getId());
                    dto.setTitle(version.getTitle());
                    dto.setContent(version.getContent());
                    dto.setCreatedAt(version.getCreatedAt());

                    return dto;

                }).toList();
    }

    @Transactional
    public CommentResponseDTO addComment(
            Long documentId,
            String email,
            CommentRequestDTO request
    ) {

        Document document = documentRepository.findById(documentId).orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Document not found"
                        ));

        boolean isOwner = document.getUser()
                        .getEmail()
                        .equals(email);

        boolean isCollaborator = documentCollaboratorRepository
                        .existsByDocumentAndCollaboratorEmail(
                                document,
                                email
                        );

        if (!isOwner && !isCollaborator) {

            throw new ForbiddenException(
                    "You do not have access to this document"
            );
        }

        Comment comment = new Comment();

        comment.setContent(
                request.getContent()
        );

        comment.setUserEmail(email);

        comment.setDocument(document);

        Comment savedComment = commentRepository.save(comment);

        CommentMessageDTO message = new CommentMessageDTO();

        message.setDocumentId(
                documentId
        );

        message.setCommentId(
                savedComment.getId()
        );

        message.setContent(
                savedComment.getContent()
        );

        message.setUserEmail(
                savedComment.getUserEmail()
        );

        User user = userRepository.findByEmail(
                                savedComment.getUserEmail()
                        )
                        .orElse(null);

        message.setUserName(

                user != null

                        ? user.getName()

                        : savedComment.getUserEmail()
        );

        message.setResolved(
                savedComment.isResolved()
        );

        message.setType(
                "COMMENT_ADDED"
        );

        message.setCreatedAt(
                savedComment
                        .getCreatedAt()
                        .toString()
        );

        messagingTemplate.convertAndSend(

                "/topic/comments/" +
                        documentId,

                message
        );

        User commenter =

                userRepository
                        .findByEmail(email)
                        .orElse(null);

        String commenterName =

                commenter != null

                        ? commenter.getName()

                        : email;

        String notificationMessage =

                commenterName +
                        " commented on '" +
                        document.getTitle() +
                        "'";

        if (
                !document.getUser()
                        .getEmail()
                        .equals(email)

        ) {
            notificationService
                    .createNotification(

                            document.getUser()
                                    .getEmail(),

                            notificationMessage
                    );
        }

        List<DocumentCollaborator> collaborators =
                documentCollaboratorRepository
                        .findAllByDocument(
                                document
                        );

        for (
                DocumentCollaborator collaborator
                : collaborators
        ) {

            if (

                    !collaborator
                            .getCollaboratorEmail()
                            .equals(email)

            ) {

                notificationService
                        .createNotification(

                                collaborator
                                        .getCollaboratorEmail(),

                                notificationMessage
                        );
            }
        }

        logActivity(
                document,
                "Added comment",
                email
        );

        CommentResponseDTO dto =
                new CommentResponseDTO();

        dto.setId(savedComment.getId());

        dto.setContent(savedComment.getContent());

        dto.setUserEmail(savedComment.getUserEmail());

        dto.setUserName(user != null
                        ? user.getName()
                        : savedComment.getUserEmail()
        );

        dto.setResolved(savedComment.isResolved());

        dto.setCreatedAt(savedComment.getCreatedAt());

        return dto;
    }

    public List<CommentResponseDTO> getComments(
            Long documentId,
            String email
    ) {

        Document document =
                documentRepository.findById(
                        documentId
                ).orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Document not found"
                        ));

        Optional<DocumentCollaborator> collaborator =
                getCollaborator(document, email);

        if (!isOwner(document, email)
                && collaborator.isEmpty()) {

            logger.warn(
                    "Unauthorized comment access by user: {} on document ID: {}",
                    email,
                    documentId
            );

            throw new ForbiddenException(
                    "You do not have permission to access comments for this document"
            );
        }

        List<Comment> comments =
                commentRepository
                        .findByDocumentOrderByCreatedAtDesc(
                                document
                        );

        return comments.stream()
                .map(comment -> {

                    CommentResponseDTO dto =
                            new CommentResponseDTO();

                    dto.setId(comment.getId());

                    dto.setContent(
                            comment.getContent()
                    );

                    dto.setUserEmail(
                            comment.getUserEmail()
                    );

                    User user = userRepository.findByEmail(
                                                comment.getUserEmail()
                                    )
                                    .orElse(null);

                    dto.setUserName(user != null ? user.getName() : comment.getUserEmail()
                    );

                    dto.setResolved(comment.isResolved());

                    dto.setCreatedAt(comment.getCreatedAt());

                    return dto;

                }).toList();
    }

    @Transactional
    @CacheEvict(
            value = "documents",
            allEntries = true
    )
    public CommentResponseDTO resolveComment(
            Long documentId,
            Long commentId,
            String email
    ) {

        Document document =
                documentRepository.findById(
                        documentId
                ).orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Document not found"
                        ));

        Comment comment =
                commentRepository.findById(
                        commentId
                ).orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Comment not found"
                        ));

        if (
                !comment.getDocument()
                        .getId()
                        .equals(documentId)
        ) {

            throw new RuntimeException(
                    "Comment does not belong to document"
            );
        }

        if (!canEdit(document, email)) {

            logger.warn(
                    "Unauthorized comment resolution attempt by user: {} on document ID: {}",
                    email,
                    documentId
            );

            throw new ForbiddenException(
                    "You do not have permission to resolve comments"
            );
        }

        comment.setResolved(true);

        Comment saved = commentRepository.save(comment);

        User resolver = userRepository
                        .findByEmail(email)
                        .orElse(null);

        String resolverName = resolver != null
                        ? resolver.getName()
                        : email;

        if (!comment.getUserEmail().equals(email)) {
            notificationService.createNotification(
                            comment.getUserEmail(),
                            resolverName +
                                    " resolved your comment on '" +
                                    document.getTitle() +
                                    "'"
                    );
        }

        CommentMessageDTO message = new CommentMessageDTO();

        message.setDocumentId(
                documentId
        );

        message.setCommentId(
                saved.getId()
        );

        message.setContent(
                saved.getContent()
        );

        message.setUserEmail(
                saved.getUserEmail()
        );

        User user = userRepository.findByEmail(
                                saved.getUserEmail()
                        )
                        .orElse(null);

        message.setUserName(user != null ? user.getName() : saved.getUserEmail());

        message.setResolved(
                saved.isResolved()
        );

        message.setType(
                "COMMENT_RESOLVED"
        );

        message.setCreatedAt(
                saved.getCreatedAt().toString()
        );

        messagingTemplate.convertAndSend(

                "/topic/comments/" + documentId,

                message
        );

        logActivity(
                document,
                "Resolved comment",
                email
        );

        CommentResponseDTO dto = new CommentResponseDTO();

        dto.setId(saved.getId());

        dto.setContent(
                saved.getContent()
        );

        dto.setUserEmail(saved.getUserEmail());

        dto.setUserName(user != null
                        ? user.getName()

                        : saved.getUserEmail()
        );

        dto.setResolved(
                saved.isResolved()
        );

        dto.setCreatedAt(
                saved.getCreatedAt()
        );

        return dto;
    }

    private boolean isOwner(Document document, String email) {
        return document.getUser().getEmail().equals(email);
    }

    private Optional<DocumentCollaborator> getCollaborator(
            Document document,
            String email) {

        return documentCollaboratorRepository
                .findByDocumentAndCollaboratorEmail(
                        document,
                        email
                );
    }

    private boolean canEdit(
            Document document,
            String email) {

        if (isOwner(document, email)) {
            return true;
        }

        Optional<DocumentCollaborator> collaborator =
                getCollaborator(document, email);

        return collaborator.isPresent()
                && collaborator.get().getPermissionType() == PermissionType.EDITOR;
    }

    private boolean canRead(
            Document document,
            String email) {

        if (isOwner(document, email)) {
            return true;
        }

        return getCollaborator(document, email).isPresent();
    }

    private DocumentResponseDTO mapToDocumentDTO(Document document) {

        DocumentResponseDTO dto =
                new DocumentResponseDTO();

        dto.setId(
                document.getId()
        );

        dto.setTitle(
                document.getTitle()
        );

        dto.setContent(
                document.getContent()
        );

        dto.setCreatedAt(
                document.getCreatedAt()
        );

        dto.setOwnerEmail(
                document.getUser()
                        .getEmail()
        );

        return dto;
    }
}