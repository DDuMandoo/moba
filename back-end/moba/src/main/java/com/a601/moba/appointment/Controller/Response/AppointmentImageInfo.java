package com.a601.moba.appointment.Controller.Response;

import lombok.Builder;

public record AppointmentImageInfo(
        Integer imageId,
        String imageUrl
) {
    @Builder
    public AppointmentImageInfo {
    }
}
