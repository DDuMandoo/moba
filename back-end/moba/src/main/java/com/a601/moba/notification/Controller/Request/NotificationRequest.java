package com.a601.moba.notification.Controller.Request;

import com.a601.moba.notification.Entity.Notification.Type;
import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public record NotificationRequest(Integer receiverId, String title, String body, Type type, String deepLink) {
}
