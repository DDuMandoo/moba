package com.a601.moba.bank.Controller.Response;

import lombok.Builder;

@Builder
public record TransferBankResponse(
        Integer depositId,
        Integer withdrawId
) {
}
