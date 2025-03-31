package com.a601.moba.wallet.Controller.Response;

import lombok.Builder;

@Builder
public record ConnectAccountResponse(
        String accessToken
) {
}
