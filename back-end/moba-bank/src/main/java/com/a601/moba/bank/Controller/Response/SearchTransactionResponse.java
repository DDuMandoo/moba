package com.a601.moba.bank.Controller.Response;

import lombok.Builder;

@Builder
public record SearchTransactionResponse(
        Long amount,
        String targetId
) {
}
