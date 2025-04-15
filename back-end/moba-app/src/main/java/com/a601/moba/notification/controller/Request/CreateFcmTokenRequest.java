package com.a601.moba.notification.controller.Request;

import lombok.Builder;

@Builder
public record CreateFcmTokenRequest(String token) {
}
