package com.a601.moba.dutch.Controller.Response;

import lombok.Builder;

@Builder
public record OcrDutchpayResponse(
        String item,
        int quantity,
        int price,
        int total
) {
}
