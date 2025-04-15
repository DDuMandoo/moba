package com.a601.moba.email.Controller.Request;

import lombok.Builder;

@Builder
public record EmailSendRequest(
        String email
) {
}
