package com.a601.moba.notification.controller.Response;

import com.a601.moba.notification.entity.Notification;
import com.a601.moba.notification.entity.Notification.Type;
import java.time.LocalDateTime;
import lombok.Builder;

@Builder
public record NotificationResponse(Integer id, String content, Type type, boolean isRead, LocalDateTime createdAt,
                                   String deepLink) {

    public static NotificationResponse from(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .content(notification.getContent())
                .type(notification.getType())
                .isRead(notification.getIsRead())
                .createdAt(notification.getCreatedAt())
                .deepLink(notification.getDeepLink())
                .build();
    }
}
