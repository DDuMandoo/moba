package com.a601.moba.appointment.Controller.Response;

import java.time.LocalDateTime;

public record AppointmentJoinResponse(
        Integer appointmentId,
        String name,
        ParticipantInfo participant
) {
    public record ParticipantInfo(
            Integer memberId,
            String name,
            LocalDateTime joinedAt
    ) {
    }
}
