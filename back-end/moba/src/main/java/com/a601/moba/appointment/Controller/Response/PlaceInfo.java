package com.a601.moba.appointment.Controller.Response;

import lombok.Builder;

public record PlaceInfo(
        Integer placeId,
        String name,
        Double latitude,
        Double longitude,
        String category,
        String kakaoUrl
) {
    @Builder
    public PlaceInfo {
    }
}
