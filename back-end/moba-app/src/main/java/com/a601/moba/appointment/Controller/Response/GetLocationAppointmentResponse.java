package com.a601.moba.appointment.Controller.Response;

import java.util.List;
import lombok.Builder;

@Builder
public record GetLocationAppointmentResponse(
        Integer appointmentId,
        List<Participant> participants
) {
    @Builder
    public record Participant(
            Integer memberId,
            String memberName,
            String memberImage,
            Double latitude,
            Double longitude
    ) {
    }
}
