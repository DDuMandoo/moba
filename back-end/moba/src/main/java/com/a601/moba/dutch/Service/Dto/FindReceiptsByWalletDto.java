package com.a601.moba.dutch.Service.Dto;

import java.time.LocalDateTime;

public record FindReceiptsByWalletDto(
        Integer dutchpayId,
        Integer appointmentId,
        String appointmentName,
        String appointmentImage,
        Integer hostId,
        String hostName,
        String hostImage,
        Long price,
        boolean status,
        LocalDateTime createdAt
) {
}
