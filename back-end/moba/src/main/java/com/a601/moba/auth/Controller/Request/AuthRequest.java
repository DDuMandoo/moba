package com.a601.moba.auth.Controller.Request;

import lombok.Builder;

@Builder
public record AuthRequest(
        String email,
        String password
) {
}
