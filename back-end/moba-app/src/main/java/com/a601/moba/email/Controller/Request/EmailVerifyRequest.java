package com.a601.moba.email.Controller.Request;

import lombok.Builder;

@Builder
public record EmailVerifyRequest(
        String email,
        String code
) {
}
