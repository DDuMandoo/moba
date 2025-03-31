package com.a601.moba.appointment.Controller.Response;

import lombok.Builder;

@Builder
public record AppointmentImageUploadResponse(
        Integer appointmentId,
        Integer imageId
) {
}
