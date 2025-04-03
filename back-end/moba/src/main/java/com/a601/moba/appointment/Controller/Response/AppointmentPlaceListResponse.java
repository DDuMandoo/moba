package com.a601.moba.appointment.Controller.Response;

import java.util.List;
import lombok.Builder;

public record AppointmentPlaceListResponse(
        Integer appointmentId,
        List<PlaceInfo> places
) {
    @Builder
    public record PlaceInfo(
            Integer placeId,
            String name,
            Double latitude,
            Double longitude,
            String address,
            String category
    ) {
    }
}
