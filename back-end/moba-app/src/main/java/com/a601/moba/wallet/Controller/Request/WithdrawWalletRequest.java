package com.a601.moba.wallet.Controller.Request;

public record WithdrawWalletRequest(
        String account,
        Long amount
) {
}
