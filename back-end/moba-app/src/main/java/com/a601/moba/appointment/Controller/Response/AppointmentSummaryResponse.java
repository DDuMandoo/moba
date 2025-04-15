package com.a601.moba.appointment.Controller.Response;

import lombok.Builder;

@Builder
public record AppointmentSummaryResponse(
        Integer totalAttendanceCount,
        Long totalSpent,
        String name,
        String imageUrl
) {
}
