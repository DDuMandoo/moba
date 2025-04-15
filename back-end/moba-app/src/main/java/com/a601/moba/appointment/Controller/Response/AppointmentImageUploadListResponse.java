package com.a601.moba.appointment.Controller.Response;

import java.util.List;
import lombok.Builder;

public record AppointmentImageUploadListResponse(
        List<AppointmentImageUploadResponse> images
) {
    @Builder
    public AppointmentImageUploadListResponse {
    }
}
