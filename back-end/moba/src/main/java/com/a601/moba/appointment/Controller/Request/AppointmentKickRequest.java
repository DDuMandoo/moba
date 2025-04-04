package com.a601.moba.appointment.Controller.Request;

import jakarta.validation.constraints.NotNull;
import java.util.List;
import lombok.Builder;

@Builder
public record AppointmentKickRequest(
        @NotNull List<Integer> memberIds
) {
}
