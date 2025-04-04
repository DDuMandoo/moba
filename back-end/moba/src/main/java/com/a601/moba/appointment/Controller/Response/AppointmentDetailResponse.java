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
        Integer placeId,
        String placeName,
        String memo,
        Boolean isEnded,
        List<ParticipantInfo> participants,
        LocalDateTime createdAt,
        Integer hostId
) {
    @Builder
    public record ParticipantInfo(
            Integer memberId,
            String name,
            String profileImage
    ) {
    }
}
