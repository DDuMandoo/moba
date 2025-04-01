package com.a601.moba.notification.Controller.Request;

import lombok.Builder;

@Builder
public record DeleteFcmTokenRequest(String token) {
}
