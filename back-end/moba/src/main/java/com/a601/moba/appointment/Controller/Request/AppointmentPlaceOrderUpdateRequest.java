package com.a601.moba.appointment.Controller.Request;

import jakarta.validation.constraints.NotNull;
import java.util.List;

public record AppointmentPlaceOrderUpdateRequest(
        @NotNull List<PlaceOrderItem> places
) {
    public record PlaceOrderItem(
            @NotNull Integer placeId,
            @NotNull Integer order
    ) {
    }
}
