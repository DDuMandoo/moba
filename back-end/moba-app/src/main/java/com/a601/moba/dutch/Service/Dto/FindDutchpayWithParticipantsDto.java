package com.a601.moba.dutch.Service.Dto;

import java.time.LocalDateTime;

public record FindDutchpayWithParticipantsDto(
        Integer dutchpayId,
        Integer appointmentId,
        String appointmentName,
        String appointmentImage,
        Long totalPrice,
        Long settlement,
        boolean isCompleted,
        LocalDateTime createdAt,
        Integer memberId,
        String memberName,
        String memberImage,
        Long price,
        boolean status
) {
}
