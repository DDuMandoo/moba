package com.a601.moba.bank.Controller.Response;

import com.a601.moba.bank.Entity.TransactionType;
import java.time.LocalDateTime;
import lombok.Builder;

@Builder
public record GetTransactionResponse(
        String targetName,
        String name,
        TransactionType type,
        Long amount,
        LocalDateTime time
) {
}
