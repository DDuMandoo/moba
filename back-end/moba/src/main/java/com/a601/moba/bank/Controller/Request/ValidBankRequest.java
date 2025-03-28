package com.a601.moba.bank.Controller.Request;

import lombok.Builder;

@Builder
public record ValidBankRequest(
        String account,
        String bank
) {
}
