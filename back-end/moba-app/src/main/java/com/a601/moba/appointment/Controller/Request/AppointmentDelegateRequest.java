package com.a601.moba.appointment.Controller.Request;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;

@Builder
public record AppointmentDelegateRequest(
        @NotNull
        Integer newHostId
) {
}
