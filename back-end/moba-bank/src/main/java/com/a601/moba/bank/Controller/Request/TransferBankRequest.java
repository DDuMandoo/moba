package com.a601.moba.bank.Controller.Request;

public record TransferBankRequest(
        String accessToken,
        String target,
        Long amount,
        String name
) {
}
