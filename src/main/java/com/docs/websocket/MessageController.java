package com.docs.websocket;

import com.docs.websocket.dto.DocumentSyncMessage;
import com.docs.websocket.dto.PresenceMessage;
import com.docs.websocket.dto.TypingMessage;
import com.docs.websocket.dto.CursorPositionDTO;
import com.docs.websocket.dto.CommentMessageDTO;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Set;

@Controller
public class MessageController {

    private final PresenceService presenceService;
    private final SimpMessagingTemplate messagingTemplate;

    public MessageController(
            SimpMessagingTemplate messagingTemplate,
            PresenceService presenceService
    ) {
        this.messagingTemplate = messagingTemplate;
        this.presenceService = presenceService;
    }

    @MessageMapping("/document-sync")
    public void syncDocument(
            @Payload DocumentSyncMessage message
    ) {

        messagingTemplate.convertAndSend(
                "/topic/document/" +
                        message.getDocumentId(),
                message
        );
    }

    @MessageMapping("/presence/join")
    public void joinDocument(
            @Payload PresenceMessage message
    ) {

        presenceService.addUser(
                message.getDocumentId(),
                message.getUserEmail()
        );

        Set<String> users =
                presenceService.getUsers(
                        message.getDocumentId()
                );

        messagingTemplate.convertAndSend(
                "/topic/presence/" +
                        message.getDocumentId(),
                users
        );
    }

    @MessageMapping("/presence/leave")
    public void leaveDocument(
            @Payload PresenceMessage message
    ) {

        presenceService.removeUser(
                message.getDocumentId(),
                message.getUserEmail()
        );

        Set<String> users =
                presenceService.getUsers(
                        message.getDocumentId()
                );

        messagingTemplate.convertAndSend(
                "/topic/presence/" +
                        message.getDocumentId(),
                users
        );
    }

    @MessageMapping("/typing")
    public void typing(
            @Payload TypingMessage message
    ) {

        messagingTemplate.convertAndSend(
                "/topic/typing/" +
                        message.getDocumentId(),
                message
        );
    }

    @MessageMapping("/cursor")
    public void handleCursorPosition(
            @Payload CursorPositionDTO dto
    ) {

        messagingTemplate.convertAndSend(
                "/topic/cursor/" +
                        dto.getDocumentId(),
                dto
        );
    }

    @MessageMapping("/comments")
    public void handleComment(
            @Payload CommentMessageDTO message
    ) {

        messagingTemplate.convertAndSend(
                "/topic/comments/" +
                        message.getDocumentId(),
                message
        );
    }
}