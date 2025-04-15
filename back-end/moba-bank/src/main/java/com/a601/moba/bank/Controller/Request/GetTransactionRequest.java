package com.a601.moba.bank.Controller.Request;

public record GetTransactionRequest(
        String account,
        String password
) {
}
