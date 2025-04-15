package com.a601.moba.bank.Controller.Response;

import lombok.Builder;

@Builder
public record ValidBankResponse(
        String accessToken
) {
}
