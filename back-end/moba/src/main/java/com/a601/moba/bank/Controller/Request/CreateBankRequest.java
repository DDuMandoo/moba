package com.a601.moba.bank.Controller.Request;

public record CreateBankRequest(
        Integer bankId,
        String name,
        String password
) {
}
