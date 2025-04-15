package com.a601.moba.appointment.Service.Dto;

import lombok.Builder;

@Builder
public record SubcategoryScore(
        String subcategory,
        Double score
) {
}
