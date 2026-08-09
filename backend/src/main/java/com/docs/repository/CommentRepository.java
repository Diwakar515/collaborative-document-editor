package com.docs.repository;

import com.docs.model.Comment;
import com.docs.model.Document;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository
        extends JpaRepository<Comment, Long> {

    List<Comment>
    findByDocumentOrderByCreatedAtDesc(
            Document document
    );
}