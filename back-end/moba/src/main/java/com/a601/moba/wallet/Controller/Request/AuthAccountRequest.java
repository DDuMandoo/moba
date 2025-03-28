package com.a601.moba.wallet.Controller.Request;

import lombok.Builder;

@Builder
public record AuthAccountRequest(
        String account,
        String bank,
        String code
) {
}
