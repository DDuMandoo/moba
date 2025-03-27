package com.a601.moba.appointment.Controller.Response;

import java.time.LocalDateTime;
import java.util.List;
import lombok.Builder;

@Builder
public record AppointmentDetailResponse(
        Integer appointmentId,
        String name,
        String imageUrl,
        LocalDateTime time,
        Double latitude,
        Double longitude,
        String memo,
        Boolean isEnded,
        List<ParticipantInfo> participants,
        LocalDateTime createdAt
) {
    @Builder
    public record ParticipantInfo(
            Integer memberId,
            String name
    ) {
    }
}
