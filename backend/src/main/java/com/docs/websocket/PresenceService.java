package com.docs.websocket;

import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

@Service
public class PresenceService {

    private final Map<Long, Set<String>>
            activeUsers = new HashMap<>();

    public synchronized void addUser(
            Long documentId,
            String email
    ) {

        activeUsers
                .computeIfAbsent(
                        documentId,
                        key -> new HashSet<>()
                )
                .add(email);
    }

    public synchronized void removeUser(
            Long documentId,
            String email
    ) {

        Set<String> users =
                activeUsers.get(documentId);

        if (users != null) {

            users.remove(email);

            if (users.isEmpty()) {
                activeUsers.remove(documentId);
            }
        }
    }

    public synchronized Set<String> getUsers(
            Long documentId
    ) {

        Set<String> users =
                activeUsers.get(documentId);

        if (users == null) {
            return Collections.emptySet();
        }

        return new HashSet<>(users);
    }
}