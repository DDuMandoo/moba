package com.a601.moba.notification.controller.Request;

import com.a601.moba.notification.entity.Notification.Type;
import lombok.Builder;

@Builder
public record NotificationRequest(Integer receiverId, String title, String body, Type type, String deepLink) {
}
