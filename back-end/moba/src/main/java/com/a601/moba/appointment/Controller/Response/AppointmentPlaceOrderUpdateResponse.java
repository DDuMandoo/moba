package com.a601.moba.appointment.Controller.Response;

import java.util.List;
import lombok.Builder;

public record AppointmentPlaceOrderUpdateResponse(
        List<PlaceOrderResult> updatedPlaces
) {
    @Builder
    public record PlaceOrderResult(
            Integer placeId,
            Integer order
    ) {
    }
}
