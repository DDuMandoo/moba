package com.a601.moba.appointment.Controller.Response;

import java.time.LocalDateTime;
import java.util.List;
import lombok.Builder;

public record AppointmentSearchResponse(
        List<AppointmentResult> results,
        Integer cursorId
) {
    @Builder
    public record AppointmentResult(
            Integer appointmentId,
            String name,
            LocalDateTime time,
            String imageUrl,
            Boolean isEnded
    ) {
    }
}

