package com.a601.moba.appointment.Controller.Response;

import lombok.Builder;

@Builder
public record AppointmentDelegateResponse(
        Integer preHostId,
        String preHostName,
        Integer newHostId,
        String newHostName
) {
}
