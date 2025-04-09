package com.a601.moba.appointment.Controller.Response;

import lombok.Builder;

@Builder
public record SubcategoryScore(
        String subcategory,
        Double score
) {
}
