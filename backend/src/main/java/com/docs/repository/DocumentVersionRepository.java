package com.docs.repository;

import com.docs.model.Document;
import com.docs.model.DocumentVersion;

import org.springframework.data.jpa.repository
        .JpaRepository;

import java.util.List;

public interface
DocumentVersionRepository extends JpaRepository<DocumentVersion, Long> {

    List<DocumentVersion> findByDocumentOrderByCreatedAtDesc(
            Document document
    );
}