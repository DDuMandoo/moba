package com.a601.moba.appointment.Controller.Response;

import java.time.LocalDateTime;
import lombok.Builder;

@Builder
public record AppointmentJoinResponse(
        Integer appointmentId,
        String name,
        ParticipantInfo participant
) {
    @Builder
    public record ParticipantInfo(
            Integer memberId,
            String name,
            LocalDateTime joinedAt
    ) {
    }
}
