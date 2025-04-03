package com.a601.moba.bank.Controller.Response;

import java.time.LocalDateTime;
import lombok.Builder;

@Builder
public record GetReceiptResponse(
        Integer receiptId,
        Integer placeId,
        String placeName,
        String category,
        String subCategory,
        Long amount,
        LocalDateTime payedAt
) {
}
