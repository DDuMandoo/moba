package com.a601.moba.appointment.Controller.Response;

import java.time.LocalDateTime;
import lombok.Builder;

@Builder
public record AppointmentListItemResponse(
        Integer appointmentId,
        String name,
        String imageUrl,
        LocalDateTime time,
        Double latitude,
        Double longitude,
        String memo,
        Boolean isEnded,
        String inviteUrl,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        LocalDateTime deletedAt
) {
}
