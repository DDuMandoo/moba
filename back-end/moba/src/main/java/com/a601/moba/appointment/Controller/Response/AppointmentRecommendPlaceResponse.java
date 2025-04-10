package com.a601.moba.appointment.Controller.Response;

import com.a601.moba.appointment.Service.Dto.RecommendedPlace;
import java.util.List;
import java.util.Map;
import lombok.Builder;

@Builder
public record AppointmentRecommendPlaceResponse(
        List<Integer> validUserIds,
        List<Integer> invalidUserIds,
        Map<String, List<RecommendedPlace>> recommendedSubcategories
) {
}
