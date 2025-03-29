package com.a601.moba.wallet.Controller.Request;

public record TransferWalletRequest(
        Integer memberId,
        Long amount
) {
}
