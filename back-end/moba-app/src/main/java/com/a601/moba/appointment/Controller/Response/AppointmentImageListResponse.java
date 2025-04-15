package com.a601.moba.appointment.Controller.Response;

import java.util.List;
import lombok.Builder;

public record AppointmentImageListResponse(
        List<AppointmentImageInfo> images,
        Integer nextCursorId
) {
    @Builder
    public AppointmentImageListResponse {
    }
}
