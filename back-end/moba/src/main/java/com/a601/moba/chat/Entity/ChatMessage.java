package com.a601.moba.chat.Entity;

import java.time.LocalDateTime;
import lombok.Builder;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "chatdb")
public record ChatMessage(
        @Id String id,
        Integer appointmentId,
        Long senderId,
        String senderName,
        String message,
        LocalDateTime sentAt
) {
    @Builder
    public ChatMessage(String id, Integer appointmentId, Long senderId, String senderName, String message,
                       LocalDateTime sentAt) {
        this.id = id;
        this.appointmentId = appointmentId;
        this.senderId = senderId;
        this.senderName = senderName;
        this.message = message;
        this.sentAt = sentAt;
    }
}
