package com.a601.moba.appointment.Service.Dto;

import lombok.Builder;

@Builder
public record RecommendedPlace(
        Integer placeId,
        String name,
        Double latitude,
        Double longitude,
        String subcategory,
        Double score,
        Integer reviewCount,
        Double distance
) {
}
