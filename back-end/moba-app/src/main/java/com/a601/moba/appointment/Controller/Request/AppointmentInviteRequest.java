package com.a601.moba.appointment.Controller.Request;

import java.util.List;

public record AppointmentInviteRequest(
        List<Integer> memberIds
) {
}
