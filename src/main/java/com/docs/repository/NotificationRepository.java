package com.docs.repository;

import com.docs.model.Notification;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository
        extends JpaRepository<
        Notification,
        Long
        > {

    List<Notification>
    findByRecipientEmailOrderByCreatedAtDesc(
            String recipientEmail
    );

    List<Notification>
    findByRecipientEmailAndReadFalse(
            String recipientEmail
    );
}