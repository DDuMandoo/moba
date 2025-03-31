package com.a601.moba.appointment.Controller.Response;

import java.util.List;
import java.util.Map;

public record AppointmentSearchResponse(
        List<Map<String, Object>> results,
        Integer cursorId
) {
}
