package com.a601.moba.appointment.Controller.Response;

import java.time.LocalDateTime;
import lombok.Builder;

@Builder
public record AppointmentCreateResponse(
        Integer appointmentId,
        String name,
        String imageUrl,
        LocalDateTime time,
        Integer placeId,
        String placeName,
        String memo,
        String inviteCode,
        boolean isEnded,
        LocalDateTime createdAt
) {
}