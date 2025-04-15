package com.a601.moba.wallet.Controller.Request;

import lombok.Builder;

@Builder
public record ConnectAccountRequest(
        String account,
        String bank
) {
}
