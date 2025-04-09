package com.a601.moba.appointment.Controller.Response;

import java.util.List;
import java.util.Map;
import lombok.Builder;

@Builder
public record AppointmentRecommendResponse(
        List<Integer> validUserIds,
        List<Integer> invalidUserIds,
        Map<String, List<SubcategoryScore>> recommendedSubcategories
) {
}
