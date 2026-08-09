package com.docs.repository;

import com.docs.model.ActivityLog;
import com.docs.model.Document;

import org.springframework.data.jpa.repository
        .JpaRepository;

import java.util.List;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    List<ActivityLog>
    findByDocumentOrderByCreatedAtDesc(
            Document document
    );
}