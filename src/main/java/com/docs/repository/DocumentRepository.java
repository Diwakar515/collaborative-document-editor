package com.docs.repository;

import com.docs.model.Document;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DocumentRepository extends JpaRepository<Document, Long> {

    // fetch all documents of a specific user
    List<Document> findByUserId(Long userId);

    Page<Document> findByUserId(Long userId, Pageable pageable);

    Page<Document> findByUserIdAndTitleContainingIgnoreCase(
            Long userId,
            String title,
            Pageable pageable
    );

    @Query("""
    SELECT d FROM Document d
    WHERE d.user.id = :userId
    AND (
        LOWER(d.title) LIKE LOWER(CONCAT(:search, '%'))
        OR LOWER(d.content) LIKE LOWER(CONCAT(:search, '%'))
    )
""")
    Page<Document> searchDocuments(
            @Param("userId") Long userId,
            @Param("search") String search,
            Pageable pageable
    );

    @Query("""
    SELECT d
    FROM Document d
    JOIN DocumentCollaborator dc
    ON dc.document.id = d.id
    WHERE dc.collaboratorEmail = :email
""")
    List<Document> findSharedDocuments(String email);

    @Query("""
    SELECT DISTINCT d
    FROM Document d

    LEFT JOIN DocumentCollaborator dc
        ON dc.document.id = d.id

    WHERE

        d.user.id = :userId

        OR

        dc.collaboratorEmail = :email
""")
    Page<Document> findAccessibleDocuments(
            @Param("userId") Long userId,
            @Param("email") String email,
            Pageable pageable
    );

    @Query("""
    SELECT DISTINCT d
    FROM Document d

    LEFT JOIN DocumentCollaborator dc
        ON dc.document.id = d.id

    WHERE

    (
        d.user.id = :userId
        OR
        dc.collaboratorEmail = :email
    )

    AND

    (
        LOWER(d.title)
            LIKE LOWER(CONCAT('%', :search, '%'))

        OR

        LOWER(d.content)
            LIKE LOWER(CONCAT('%', :search, '%'))
    )
""")
    Page<Document> searchAccessibleDocuments(
            @Param("userId") Long userId,
            @Param("email") String email,
            @Param("search") String search,
            Pageable pageable
    );
}