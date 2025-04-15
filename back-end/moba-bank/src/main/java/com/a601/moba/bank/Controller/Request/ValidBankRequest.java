package com.a601.moba.bank.Controller.Request;

import lombok.Builder;

@Builder
public record ValidBankRequest(
        Integer uniqueId,
        String account,
        String bank
) {
}
