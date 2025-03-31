package com.a601.moba.wallet.Controller.Response;

import java.time.LocalDateTime;
import java.util.List;
import lombok.Builder;

@Builder
public record GetAccountResponse(
        List<Account> accounts // accounts 리스트를 포함
) {
    @Builder
    public record Account(
            String account,
            String type,
            boolean isMain,
            LocalDateTime createdAt
    ) {
    }
}

