package com.a601.moba.appointment.Controller.Response;

import java.time.LocalDateTime;
import java.util.List;

public record AppointmentSearchResponse(
        List<AppointmentResult> results,
        Integer cursorId
) {
    public record AppointmentResult(
            Integer appointmentId,
            String name,
            LocalDateTime time,
            String imageUrl,
            Boolean isEnded
    ) {
    }
}

