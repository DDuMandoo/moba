package com.a601.moba.appointment.Controller.Response;

import lombok.Builder;

public record AddAppointmentPlaceResponse(
        Integer placeId,
        String name,
        Integer order,
        Double latitude,
        Double longitude,
        String kakaoUrl,
        String address
) {
    @Builder
    public AddAppointmentPlaceResponse {
    }
}
