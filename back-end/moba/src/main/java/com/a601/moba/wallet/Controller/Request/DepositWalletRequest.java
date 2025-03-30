package com.a601.moba.wallet.Controller.Request;

public record DepositWalletRequest(
        String account,
        Long amount
) {
}
