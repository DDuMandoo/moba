package com.a601.moba.appointment.Controller.Request;

import lombok.Builder;

@Builder
public record AppointmentJoinRequest(
        Integer appointmentId
) {
}