package com.a601.moba.appointment.Controller.Response;

import java.time.LocalDateTime;
import java.util.List;
import lombok.Builder;

public record AppointmentSearchWithMembersResponse(
        List<AppointmentInfo> appointments,
        Integer cursorId
) {
    @Builder
    public record AppointmentInfo(
            Integer appointmentId,
            String name,
            LocalDateTime time,
            String imageUrl,
            Boolean isEnded,
            List<MemberInfo> members
    ) {
    }

    @Builder
    public record MemberInfo(
            Integer memberId,
            String name,
            String email,
            String profileImage
    ) {
    }
}
