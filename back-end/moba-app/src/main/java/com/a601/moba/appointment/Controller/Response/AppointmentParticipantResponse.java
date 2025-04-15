package com.a601.moba.appointment.Controller.Response;

import com.a601.moba.appointment.Constant.State;
import java.util.List;
import lombok.Builder;

@Builder
public record AppointmentParticipantResponse(
        Integer appointmentId,
        List<ParticipantInfo> participants
) {
    @Builder
    public record ParticipantInfo(
            Integer memberId,
            String name,
            String profileImage,
            State state
    ) {
    }
}
