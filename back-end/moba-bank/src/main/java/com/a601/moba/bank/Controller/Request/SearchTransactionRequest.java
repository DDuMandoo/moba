package com.a601.moba.bank.Controller.Request;

public record SearchTransactionRequest(
        String accessToken,
        Integer id
) {
}
