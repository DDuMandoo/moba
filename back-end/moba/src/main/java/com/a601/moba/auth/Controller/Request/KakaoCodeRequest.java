package com.a601.moba.auth.Controller.Request;

import lombok.Builder;

@Builder
public record KakaoCodeRequest(
        String code
) {
}
