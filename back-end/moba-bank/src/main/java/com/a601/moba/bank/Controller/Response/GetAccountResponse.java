package com.a601.moba.bank.Controller.Response;

import lombok.Builder;

@Builder
public record GetAccountResponse(
        Integer uniqueId,
        String bankName,
        String account,
        String name,
        Long balance
) {
}
