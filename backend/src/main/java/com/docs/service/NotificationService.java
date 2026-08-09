package com.docs.service;

import com.docs.dto.NotificationResponseDTO;
import com.docs.exception.ForbiddenException;
import com.docs.exception.ResourceNotFoundException;
import com.docs.model.Notification;
import com.docs.repository.NotificationRepository;
import com.docs.websocket.dto.NotificationMessageDTO;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public NotificationService(
            NotificationRepository notificationRepository,
            SimpMessagingTemplate messagingTemplate
    ) {
        this.notificationRepository =
                notificationRepository;

        this.messagingTemplate =
                messagingTemplate;
    }

    public void createNotification(
            String recipientEmail,
            String message
    ) {

        Notification notification =
                new Notification();

        notification.setRecipientEmail(
                recipientEmail
        );

        notification.setMessage(
                message
        );

        Notification savedNotification =
                notificationRepository.save(
                        notification
                );

        NotificationMessageDTO dto =
                new NotificationMessageDTO();

        dto.setId(
                savedNotification.getId()
        );

        dto.setMessage(
                savedNotification.getMessage()
        );

        dto.setRead(
                savedNotification.isRead()
        );

        dto.setCreatedAt(
                savedNotification
                        .getCreatedAt()
                        .toString()
        );

        messagingTemplate.convertAndSend(
                "/topic/notifications/"
                        + recipientEmail,
                dto
        );
    }

    public List<NotificationResponseDTO>
    getNotifications(
            String recipientEmail
    ) {

        return notificationRepository
                .findByRecipientEmailOrderByCreatedAtDesc(
                        recipientEmail
                )
                .stream()
                .map(notification -> {

                    NotificationResponseDTO dto =
                            new NotificationResponseDTO();

                    dto.setId(
                            notification.getId()
                    );

                    dto.setMessage(
                            notification.getMessage()
                    );

                    dto.setRead(
                            notification.isRead()
                    );

                    dto.setCreatedAt(
                            notification.getCreatedAt()
                    );

                    return dto;
                })
                .toList();
    }

    public void markAsRead(
            Long notificationId,
            String userEmail
    ) {

        Notification notification =
                notificationRepository
                        .findById(notificationId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Notification not found"
                                )
                        );

        if (
                !notification
                        .getRecipientEmail()
                        .equals(userEmail)
        ) {

            throw new ForbiddenException(
                    "You do not have permission to modify this notification"
            );
        }

        notification.setRead(true);

        notificationRepository.save(
                notification
        );
    }

    public void markAllAsRead(
            String userEmail
    ) {

        List<Notification> notifications =
                notificationRepository
                        .findByRecipientEmailAndReadFalse(
                                userEmail
                        );

        notifications.forEach(
                notification ->
                        notification.setRead(true)
        );

        notificationRepository.saveAll(
                notifications
        );
    }
}