package com.a601.moba.wallet.Controller.Response;

import java.time.LocalDateTime;
import lombok.Builder;

@Builder
public record DepositWalletResponse(
        String account,
        String bank,
        Long amount,
        LocalDateTime time
) {
}
