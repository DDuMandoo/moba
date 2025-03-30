package com.a601.moba.wallet.Controller.Response;

import com.a601.moba.wallet.Entity.TransactionType;
import java.time.LocalDateTime;
import java.util.List;
import lombok.Builder;

@Builder
public record GetTransactionResponse(
        Integer cursorId,
        LocalDateTime cursorPayAt,
        List<transaction> transactions
) {
    @Builder
    public record transaction(
            String name,
            String image,
            LocalDateTime payAt,
            Long amount,
            TransactionType type
    ) {
    }
}
