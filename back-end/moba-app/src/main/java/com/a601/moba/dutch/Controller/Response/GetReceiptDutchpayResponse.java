package com.a601.moba.dutch.Controller.Response;

import java.time.LocalDateTime;
import lombok.Builder;

@Builder
public record GetReceiptDutchpayResponse(
        Integer dutchpayId,
        Integer appointmentId,
        String appointmentName,
        String appointmentImage,
        Integer hostId,
        String hostName,
        String hostImage,
        Long price,
        boolean isCompleted,
        LocalDateTime time
) {
}
