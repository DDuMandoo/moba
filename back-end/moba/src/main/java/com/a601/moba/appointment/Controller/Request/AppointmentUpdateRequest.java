package com.a601.moba.appointment.Controller.Request;

import java.time.LocalDateTime;
import lombok.Builder;

@Builder
public record AppointmentUpdateRequest(
        String name,
        LocalDateTime time,
        Integer placeId,
        String memo
) {
}
