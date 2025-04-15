package com.a601.moba.appointment.Controller.Response;

import java.util.List;
import lombok.Builder;

public record PlaceSearchResponse(
        List<PlaceInfo> results,
        Integer cursorId
) {
    @Builder
    public PlaceSearchResponse {
    }
}
