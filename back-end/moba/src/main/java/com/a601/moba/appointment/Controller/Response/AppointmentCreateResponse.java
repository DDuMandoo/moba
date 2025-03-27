package com.a601.moba.appointment.Controller.Response;

import java.time.LocalDateTime;

public record AppointmentCreateResponse(
        Integer appointmentId,
        String name,
        String imageUrl,
        LocalDateTime time,
        Double latitude,
        Double longitude,
        String memo,
        String inviteCode,
        boolean isEnded,
        LocalDateTime createdAt
) {
}