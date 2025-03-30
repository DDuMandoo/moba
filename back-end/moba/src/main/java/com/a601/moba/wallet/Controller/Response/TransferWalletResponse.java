package com.a601.moba.wallet.Controller.Response;

import java.time.LocalDateTime;
import lombok.Builder;

@Builder
public record TransferWalletResponse(
        Integer memberId,
        String name,
        String image,
        Long amount,
        LocalDateTime time
) {
}
