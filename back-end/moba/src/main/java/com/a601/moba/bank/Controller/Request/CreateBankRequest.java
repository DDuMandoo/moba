package com.a601.moba.bank.Controller.Request;

public record CreateBankRequest(
        Integer bankId,
        Integer uniqueId,
        String name,
        String password
) {
}
