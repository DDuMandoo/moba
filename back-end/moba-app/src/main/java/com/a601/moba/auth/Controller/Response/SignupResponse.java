package com.a601.moba.auth.Controller.Response;

import lombok.Builder;

@Builder
public record SignupResponse(
        Integer memberId,
        String email,
        String name,
        String profileImage
) {
}
