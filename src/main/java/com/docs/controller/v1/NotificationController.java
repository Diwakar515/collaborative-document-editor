package com.docs.controller.v1;

import com.docs.dto.ApiResponse;
import com.docs.dto.NotificationResponseDTO;

import com.docs.service.NotificationService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService
            notificationService;

    public NotificationController(
            NotificationService notificationService
    ) {

        this.notificationService = notificationService;
    }

    @GetMapping
    public ApiResponse<List<NotificationResponseDTO>> getNotifications() {
        String email =

                org.springframework.security
                        .core.context.SecurityContextHolder
                        .getContext()
                        .getAuthentication()
                        .getName();

        List<NotificationResponseDTO>
                notifications =

                notificationService
                        .getNotifications(
                                email
                        );

        ApiResponse<
                List<NotificationResponseDTO>
                > response =

                new ApiResponse<>();

        response.setSuccess(true);

        response.setMessage(
                "Notifications fetched successfully"
        );

        response.setData(
                notifications
        );

        return response;
    }

    @PatchMapping(
            "/{id}/read"
    )
    public ApiResponse<Object> markAsRead(
            @PathVariable
            Long id
    ) {

        String email =

                org.springframework.security
                        .core.context
                        .SecurityContextHolder
                        .getContext()
                        .getAuthentication()
                        .getName();

        notificationService
                .markAsRead(

                        id,

                        email
                );

        ApiResponse<Object>
                response =

                new ApiResponse<>();

        response.setSuccess(
                true
        );

        response.setMessage(
                "Notification marked as read"
        );

        response.setData(
                null
        );

        return response;
    }

    @PatchMapping(
            "/read-all"
    )
    public ApiResponse<Object> markAllAsRead() {

        String email =

                org.springframework.security
                        .core.context
                        .SecurityContextHolder
                        .getContext()
                        .getAuthentication()
                        .getName();

        notificationService
                .markAllAsRead(
                        email
                );

        ApiResponse<Object>
                response =

                new ApiResponse<>();

        response.setSuccess(
                true
        );

        response.setMessage(
                "All notifications marked as read"
        );

        response.setData(
                null
        );

        return response;
    }
}