package com.docs.repository;

import com.docs.model.Document;
import com.docs.model.DocumentCollaborator;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DocumentCollaboratorRepository extends JpaRepository<DocumentCollaborator, Long> {

    boolean existsByDocumentAndCollaboratorEmail(Document document, String email);

    Optional<DocumentCollaborator> findByDocumentAndCollaboratorEmail(
            Document document,
            String email
    );

    List<DocumentCollaborator> findAllByDocument(Document document);

}